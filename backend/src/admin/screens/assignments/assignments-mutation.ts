import { useEffect, useRef, useState } from "react"
import { useFetcher } from "react-router"
import type { AssignmentActionData } from "./assignments-types"

type UseAssignmentsMutationOptions = {
	onPermitCreated: (permitId: string) => void
	onPermitRenamed: () => void
	onAssignmentSaved: () => void
}

export function useAssignmentsMutation({
	onPermitCreated,
	onPermitRenamed,
	onAssignmentSaved,
}: UseAssignmentsMutationOptions) {
	const fetcher = useFetcher<AssignmentActionData>()
	const [successMessage, setSuccessMessage] = useState("")
	const mutationInFlight = useRef(false)
	const isSubmitting = fetcher.state !== "idle"

	useEffect(() => {
		if (fetcher.state === "idle") mutationInFlight.current = false
	}, [fetcher.state])

	useEffect(() => {
		if (fetcher.state !== "idle" || !fetcher.data?.ok) return

		setSuccessMessage(fetcher.data.message)
		if (fetcher.data.intent === "create-permit") {
			onPermitCreated(fetcher.data.permitId)
		}
		if (fetcher.data.intent === "rename-permit") onPermitRenamed()
		if (fetcher.data.intent === "save-assignments") onAssignmentSaved()
		fetcher.reset()
	}, [
		fetcher.data,
		fetcher.reset,
		fetcher.state,
		onAssignmentSaved,
		onPermitCreated,
		onPermitRenamed,
	])

	useEffect(() => {
		if (!successMessage) return
		const timeout = window.setTimeout(() => setSuccessMessage(""), 4000)
		return () => window.clearTimeout(timeout)
	}, [successMessage])

	function startMutation() {
		if (mutationInFlight.current || fetcher.state !== "idle") return false
		mutationInFlight.current = true
		return true
	}

	return {
		fetcher,
		isSubmitting,
		successMessage,
		startMutation,
		dismissSuccess: () => setSuccessMessage(""),
	}
}
