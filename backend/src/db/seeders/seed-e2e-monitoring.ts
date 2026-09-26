import { pool } from "@config"
import { db } from "@db"
import { eq } from "drizzle-orm"
import {
	cleaningCommonRecords,
	cleaningHeaders,
	groomingDetails,
	participants,
	permits,
	shearingHeaders,
	shearingRecords,
} from "../schema"

const MONITORING_PERMITS = [
	{
		permitId: "permit-seed-asg-02",
		suffix: "02",
		tagNumber: 920002,
		fleeceNumber: "930002",
	},
	{
		permitId: "permit-seed-asg-03",
		suffix: "03",
		tagNumber: 920003,
		fleeceNumber: "930003",
	},
] as const

async function seedE2eMonitoring() {
	await db.transaction(async (tx) => {
		for (const fixture of MONITORING_PERMITS) {
			await tx
				.update(permits)
				.set({
					syncStatus: "synced",
					syncedAt: new Date("2026-09-01T12:00:00.000Z"),
					updatedAt: new Date(),
				})
				.where(eq(permits.id, fixture.permitId))

			await tx.insert(participants).values({
				id: `participant-e2e-monitoring-${fixture.suffix}`,
				permitId: fixture.permitId,
				name: "Participante",
				lastNames: `E2E ${fixture.suffix}`,
				gender: "F",
				identityNumber: `9100${fixture.suffix}`,
				signature: "",
				notes: "Fixture de seguimiento",
			})

			await tx.insert(shearingHeaders).values({
				id: `shearing-header-e2e-monitoring-${fixture.suffix}`,
				permitId: fixture.permitId,
				site: "Corral E2E",
				latitude: -19.5,
				longitude: -65.75,
				roundupCount: 1,
				eventDate: "01/09/2026",
				startTime: "08:00",
				endTime: "10:00",
				isCompleted: true,
			})

			await tx.insert(shearingRecords).values({
				id: `shearing-record-e2e-monitoring-${fixture.suffix}`,
				permitId: fixture.permitId,
				tagNumber: fixture.tagNumber,
				sex: "F",
				ageCategory: "Adulto",
				liveWeight: 42.5,
				fiberLength: 4.8,
				bodyCondition: "Bueno",
				gestationStatus: "No",
				externalParasites: [],
				mangeSeverity: "Ninguna",
				hasDandruff: false,
				isSheared: true,
				isDead: false,
				observations: "Fixture de seguimiento",
			})

			await tx.insert(cleaningHeaders).values({
				id: `cleaning-header-e2e-monitoring-${fixture.suffix}`,
				permitId: fixture.permitId,
				startDate: "02/09/2026",
				endDate: "03/09/2026",
				site: "Centro E2E",
				supervisors: "Equipo E2E",
				isCompleted: true,
			})

			const cleaningRecordId = `cleaning-record-e2e-monitoring-${fixture.suffix}`
			await tx.insert(cleaningCommonRecords).values({
				id: cleaningRecordId,
				permitId: fixture.permitId,
				fleeceNumber: fixture.fleeceNumber,
				grossWeight: 3200,
			})

			await tx.insert(groomingDetails).values({
				id: `grooming-e2e-monitoring-${fixture.suffix}`,
				cleaningCommonId: cleaningRecordId,
				cleanWeight: 2400,
				dirtyWeight: 500,
				totalWeight: 2900,
				isCompleted: true,
			})
		}
	})
}

seedE2eMonitoring()
	.then(async () => {
		await pool.end()
		console.log("📊 E2E monitoring fixtures seeded")
	})
	.catch(async (error: unknown) => {
		await pool.end()
		console.error(error)
		process.exit(1)
	})
