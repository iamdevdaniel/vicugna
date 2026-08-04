import type { PermitStepStatus } from "@definitions/types"
export const getDependentStepStatus = (
	isUnlocked: boolean,
	isDone: boolean,
): PermitStepStatus => {
	if (!isUnlocked) return "disabled"
	if (isDone) return "done"
	return "ready"
}
