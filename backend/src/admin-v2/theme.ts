export const adminThemeStorageKey = "vicugna-admin-theme"

export const adminThemeScript = `
try {
	const savedTheme = localStorage.getItem("${adminThemeStorageKey}");
	document.documentElement.dataset.theme = savedTheme === "dark" ? "dark" : "light";
} catch {
	document.documentElement.dataset.theme = "light";
}
`
