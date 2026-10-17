import { create } from "zustand"

type NavigationMode = "free" | "current-screen" | "overview-only"
type ActiveNavigationMode = "current-screen" | "overview-only"

type DataOperationState = {
	navigationMode: NavigationMode
}

export const useDataOperationGuard = create<DataOperationState>()(() => ({
	navigationMode: "free",
}))

export function tryStartDataOperation(
	navigationMode: ActiveNavigationMode = "current-screen",
): boolean {
	if (useDataOperationGuard.getState().navigationMode !== "free") return false

	useDataOperationGuard.setState({ navigationMode })
	return true
}

export function finishDataOperation(): void {
	useDataOperationGuard.setState({
		navigationMode: "free",
	})
}
