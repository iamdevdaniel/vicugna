import { Button } from "@mantine/core"
import { useEffect, useRef } from "react"
import { Form, useNavigation } from "react-router"

export function MonitoringReopenForm({ permitId }: { permitId: string }) {
	const navigation = useNavigation()
	const submissionStarted = useRef(false)
	const isReopening =
		navigation.state === "submitting" &&
		navigation.formData?.get("intent") === "reopen-permit"

	useEffect(() => {
		if (navigation.state === "idle") submissionStarted.current = false
	}, [navigation.state])

	return (
		<Form method="post">
			<input type="hidden" name="intent" value="reopen-permit" />
			<input type="hidden" name="permitId" value={permitId} />
			<Button
				type="submit"
				color="yellow"
				size="sm"
				disabled={isReopening}
				onClick={(event) => {
					if (
						submissionStarted.current ||
						!window.confirm(
							"¿Reabrir este permiso para que pueda editarse nuevamente?",
						)
					) {
						event.preventDefault()
						return
					}
					submissionStarted.current = true
				}}
			>
				{isReopening ? "Reabriendo..." : "Reabrir permiso"}
			</Button>
		</Form>
	)
}
