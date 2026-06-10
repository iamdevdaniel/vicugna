import type { ReactNode } from "react"
import { OverviewStep, type OverviewStepAction } from "./OverviewStep"

export type StepState = "ready" | "done" | "disabled"

export interface StepConfig {
	title: string
	state: StepState
	action?: OverviewStepAction
	details?: ReactNode
}

export const StepList = ({ steps }: { steps: StepConfig[] }) => {
	return (
		<>
			{steps.map((step, index) => (
				<OverviewStep
					key={step.title}
					number={index + 1}
					title={step.title}
					state={step.state}
					action={step.action}
					details={step.details}
				/>
			))}
		</>
	)
}
