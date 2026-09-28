import assert from "node:assert/strict"
import { test } from "node:test"
import "fake-indexeddb/auto"
import type { ParticipantFormData, PermitData } from "../../definitions/types"
import {
	createSingleParticipant,
	deleteSingleParticipant,
	subscribeBulkParticipants,
	updateSingleParticipant,
} from "./dal-participants"
import {
	getWebFieldDatabase,
	WebFieldDatabase,
	type WebPermitRecord,
} from "./setup"

const participant: ParticipantFormData = {
	name: "Ana",
	lastNames: "Quispe Flores",
	gender: "F",
	identityNumber: "910001",
	signature: JSON.stringify(["M20 50 L80 20 L140 50"]),
	notes: "Prueba web",
}

function makePermit(id: string, accountId: string): WebPermitRecord {
	return {
		id,
		permitNumber: "PWA-TEST",
		seasonId: "season",
		seasonName: "Temporada",
		communityId: "agua-rica",
		regionalId: "calacoto",
		departmentId: "la-paz",
		userId: accountId,
		userFullName: "Usuario PWA",
		isActiveAssignmentUser: true,
		syncStatus: "in_progress",
		syncedAt: null,
		participantsStatus: "ready",
		shearingStatus: "disabled",
		cleaningStatus: "disabled",
		syncVersion: null,
	}
}

test("participant writes persist and update derived statuses", async () => {
	const accountId = crypto.randomUUID()
	const permitId = crypto.randomUUID()
	const database = getWebFieldDatabase(accountId)

	try {
		await database.permits.add(makePermit(permitId, accountId))
		const created = await createSingleParticipant(
			accountId,
			permitId,
			participant,
		)

		const storedParticipant = await database.participants.get(created.id)
		assert.ok(storedParticipant)
		const { createdAt: _, ...participantData } = storedParticipant
		assert.deepEqual(participantData, created)
		assert.deepEqual(pickStatuses(await database.permits.get(permitId)), {
			participantsStatus: "done",
			shearingStatus: "ready",
			cleaningStatus: "disabled",
		})

		await updateSingleParticipant(accountId, created.id, {
			...participant,
			name: "Rosa",
		})
		const secondConnection = new WebFieldDatabase(accountId)
		assert.equal(
			(await secondConnection.participants.get(created.id))?.name,
			"Rosa",
		)
		secondConnection.close()

		await deleteSingleParticipant(accountId, created.id)
		assert.equal(await database.participants.count(), 0)
		assert.deepEqual(pickStatuses(await database.permits.get(permitId)), {
			participantsStatus: "ready",
			shearingStatus: "disabled",
			cleaningStatus: "disabled",
		})
	} finally {
		await database.delete()
	}
})

test("a failed status update rolls back the participant insert", async () => {
	const accountId = crypto.randomUUID()
	const permitId = crypto.randomUUID()
	const database = getWebFieldDatabase(accountId)

	try {
		const permit = makePermit(permitId, accountId)
		await database.permits.add(permit)
		const failStatusUpdate = () => {
			throw new Error("Forced status failure")
		}
		database.permits.hook("updating").subscribe(failStatusUpdate)
		try {
			await assert.rejects(
				createSingleParticipant(accountId, permitId, participant),
				/Forced status failure/,
			)
		} finally {
			database.permits.hook("updating").unsubscribe(failStatusUpdate)
		}

		assert.equal(await database.participants.count(), 0)
		assert.deepEqual(await database.permits.get(permitId), permit)
	} finally {
		await database.delete()
	}
})

test("live participant reads emit committed changes", async () => {
	const accountId = crypto.randomUUID()
	const permitId = crypto.randomUUID()
	const database = getWebFieldDatabase(accountId)

	try {
		await database.permits.add(makePermit(permitId, accountId))
		const receivedParticipant = new Promise<void>((resolve, reject) => {
			let unsubscribe = () => {}
			unsubscribe = subscribeBulkParticipants(accountId, permitId, {
				onChange: (participants) => {
					if (participants.length === 1) {
						unsubscribe()
						resolve()
					}
				},
				onError: reject,
			})
		})

		await createSingleParticipant(accountId, permitId, participant)
		await receivedParticipant
	} finally {
		await database.delete()
	}
})

function pickStatuses(permit: PermitData | undefined) {
	assert.ok(permit)
	return {
		participantsStatus: permit.participantsStatus,
		shearingStatus: permit.shearingStatus,
		cleaningStatus: permit.cleaningStatus,
	}
}
