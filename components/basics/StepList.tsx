import type { ReactNode } from "react"
import { OverviewStep, type OverviewStepAction } from "./OverviewStep"

export interface StepConfig {
	title: string
	state: "ready" | "done" | "disabled"
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
