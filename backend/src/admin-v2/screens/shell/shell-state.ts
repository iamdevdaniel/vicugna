import { useNavigation } from "react-router"
import { adminThemeStorageKey } from "../../theme"

export function useShellState() {
	const navigation = useNavigation()

	return {
		isNavigating: navigation.state !== "idle",
		toggleTheme,
	}
}

function toggleTheme() {
	const root = document.documentElement
	const theme = root.dataset.theme === "dark" ? "light" : "dark"
	root.dataset.theme = theme

	try {
		localStorage.setItem(adminThemeStorageKey, theme)
	} catch {
		// The selected theme still applies for the current page.
	}
}
