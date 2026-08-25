import type { PermitStepStatus } from "@definitions/types"

export function areCleaningRecordsComplete(
	recordIds: string[],
	completedGroomingIds: Set<string>,
	completedDehearingIds: Set<string>,
): boolean {
	return (
		recordIds.length > 0 &&
		recordIds.every(
			(recordId) =>
				completedGroomingIds.has(recordId) ||
				completedDehearingIds.has(recordId),
		)
	)
}

export const getDependentStepStatus = (
	isUnlocked: boolean,
	isDone: boolean,
): PermitStepStatus => {
	if (!isUnlocked) return "disabled"
	if (isDone) return "done"
	return "ready"
}
