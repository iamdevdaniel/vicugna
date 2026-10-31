import type { PermitData } from "@definitions/types"

export type PermitStatuses = Pick<
	PermitData,
	"participantsStatus" | "shearingStatus" | "cleaningStatus"
>

export type PermitStatusSource = {
	participantCount: number
	shearingHeaderCompleted: boolean
	shearingRecordCount: number
	cleaningHeaderCompleted: boolean
	cleaningRecordIds: ReadonlySet<string>
	completedCleaningRecordIds: ReadonlySet<string>
}

export type PermitStatusChange = {
	participantCountDelta?: 1 | -1
	shearingHeaderCompleted?: boolean
	shearingRecordCountDelta?: 1 | -1
	cleaningHeaderCompleted?: boolean
	cleaningRecord?:
		| { id: string; exists: true; isCompleted: boolean }
		| { id: string; exists: false }
}

function getDependentStepStatus(
	isUnlocked: boolean,
	isDone: boolean,
): PermitData["participantsStatus"] {
	if (!isUnlocked) return "disabled"
	if (isDone) return "done"
	return "ready"
}

export function areCleaningRecordsComplete(
	recordIds: Iterable<string>,
	completedRecordIds: ReadonlySet<string>,
): boolean {
	const ids = [...recordIds]
	return ids.length > 0 && ids.every((id) => completedRecordIds.has(id))
}

export function getPermitStatuses(source: PermitStatusSource): PermitStatuses {
	const participantsStatus = source.participantCount > 0 ? "done" : "ready"
	const shearingStatus = getDependentStepStatus(
		participantsStatus === "done",
		source.shearingHeaderCompleted && source.shearingRecordCount > 0,
	)
	const cleaningIsComplete =
		source.cleaningHeaderCompleted &&
		areCleaningRecordsComplete(
			source.cleaningRecordIds,
			source.completedCleaningRecordIds,
		)

	return {
		participantsStatus,
		shearingStatus,
		cleaningStatus: getDependentStepStatus(
			shearingStatus === "done",
			cleaningIsComplete,
		),
	}
}

export function applyPermitStatusChange(
	currentState: PermitStatusSource,
	change: PermitStatusChange,
): PermitStatusSource {
	const cleaningRecordIds = new Set(currentState.cleaningRecordIds)
	const completedCleaningRecordIds = new Set(
		currentState.completedCleaningRecordIds,
	)

	if (change.cleaningRecord) {
		const { id } = change.cleaningRecord
		if (change.cleaningRecord.exists) {
			cleaningRecordIds.add(id)
			if (change.cleaningRecord.isCompleted) {
				completedCleaningRecordIds.add(id)
			} else {
				completedCleaningRecordIds.delete(id)
			}
		} else {
			cleaningRecordIds.delete(id)
			completedCleaningRecordIds.delete(id)
		}
	}

	return {
		participantCount:
			currentState.participantCount + (change.participantCountDelta ?? 0),
		shearingHeaderCompleted:
			change.shearingHeaderCompleted ??
			currentState.shearingHeaderCompleted,
		shearingRecordCount:
			currentState.shearingRecordCount +
			(change.shearingRecordCountDelta ?? 0),
		cleaningHeaderCompleted:
			change.cleaningHeaderCompleted ??
			currentState.cleaningHeaderCompleted,
		cleaningRecordIds,
		completedCleaningRecordIds,
	}
}
