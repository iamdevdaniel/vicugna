import { OverviewStep } from "./OverviewStep"

export interface StepConfig {
	title: string
	state?: "ready" | "done" | "disabled"
	onAction: () => void
	details?: Array<{ label: string; value: string }>
	actionLabel?: string
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
					onAction={step.onAction}
					details={step.details}
					actionLabel={step.actionLabel}
				/>
			))}
		</>
	)
}
