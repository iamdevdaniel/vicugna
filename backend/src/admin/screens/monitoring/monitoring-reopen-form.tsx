import { Button } from "@mantine/core"
import { useEffect, useRef } from "react"
import { Form, useNavigation } from "react-router"

export function MonitoringReopenForm({ permitId }: { permitId: string }) {
	return (
		<MonitoringStatusForm
			permitId={permitId}
			intent="reopen-permit"
			confirmation="¿Reabrir este permiso para que pueda editarse nuevamente?"
			idleLabel="Reabrir permiso"
			workingLabel="Reabriendo..."
		/>
	)
}

export function MonitoringCancelReopeningForm({
	permitId,
}: {
	permitId: string
}) {
	return (
		<MonitoringStatusForm
			permitId={permitId}
			intent="cancel-reopening"
			confirmation="¿Cancelar la reapertura de este permiso?"
			idleLabel="Cancelar reapertura"
			workingLabel="Cancelando..."
		/>
	)
}

function MonitoringStatusForm({
	permitId,
	intent,
	confirmation,
	idleLabel,
	workingLabel,
}: {
	permitId: string
	intent: "reopen-permit" | "cancel-reopening"
	confirmation: string
	idleLabel: string
	workingLabel: string
}) {
	const navigation = useNavigation()
	const submissionStarted = useRef(false)
	const isSubmitting =
		navigation.state === "submitting" &&
		navigation.formData?.get("intent") === intent

	useEffect(() => {
		if (navigation.state === "idle") submissionStarted.current = false
	}, [navigation.state])

	return (
		<Form method="post">
			<input type="hidden" name="intent" value={intent} />
			<input type="hidden" name="permitId" value={permitId} />
			<Button
				type="submit"
				color="yellow"
				size="sm"
				disabled={isSubmitting}
				onClick={(event) => {
					if (
						submissionStarted.current ||
						!window.confirm(confirmation)
					) {
						event.preventDefault()
						return
					}
					submissionStarted.current = true
				}}
			>
				{isSubmitting ? workingLabel : idleLabel}
			</Button>
		</Form>
	)
}
