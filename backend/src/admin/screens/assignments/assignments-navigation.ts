import { useEffect } from "react"
import { useBlocker } from "react-router"

type AssignmentNavigationGuardOptions = {
	hasUnsavedChanges: boolean
	isMutationPending: boolean
	onDiscard: () => void
}

export function useAssignmentNavigationGuard({
	hasUnsavedChanges,
	isMutationPending,
	onDiscard,
}: AssignmentNavigationGuardOptions) {
	const shouldWarn = hasUnsavedChanges || isMutationPending
	const blocker = useBlocker(shouldWarn)

	useEffect(() => {
		if (blocker.state !== "blocked") return

		if (window.confirm(getLeaveWarning(isMutationPending))) {
			onDiscard()
			blocker.proceed()
			return
		}

		blocker.reset()
	}, [blocker, isMutationPending, onDiscard])

	useEffect(() => {
		if (!shouldWarn) return

		const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
			event.preventDefault()
			event.returnValue = ""
		}
		window.addEventListener("beforeunload", warnBeforeLeaving)
		return () =>
			window.removeEventListener("beforeunload", warnBeforeLeaving)
	}, [shouldWarn])
}

function getLeaveWarning(isMutationPending: boolean) {
	return isMutationPending
		? "Hay una operación en curso. Si sales, puede completarse sin mostrar el resultado. ¿Quieres salir?"
		: "Hay cambios sin guardar. ¿Quieres descartarlos?"
}
