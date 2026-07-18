import type { StepState } from "@components"
export const getDependentStepState = (
	isUnlocked: boolean,
	isDone: boolean,
): StepState => {
	if (!isUnlocked) return "disabled"
	if (isDone) return "done"
	return "ready"
}
