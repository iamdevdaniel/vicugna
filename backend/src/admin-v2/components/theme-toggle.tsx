import { adminThemeStorageKey } from "../theme"

export function ThemeToggle() {
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

	return (
		<button
			type="button"
			className="btn btn-ghost btn-sm"
			onClick={toggleTheme}
			aria-label="Cambiar tema"
			title="Cambiar tema"
		>
			<svg
				className="theme-icon-light h-5 w-5"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9" />
			</svg>
			<svg
				className="theme-icon-dark h-5 w-5"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<circle cx="12" cy="12" r="4" />
				<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
			</svg>
			<span className="hidden sm:inline">Tema</span>
		</button>
	)
}
