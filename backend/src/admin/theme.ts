import {
	type CSSVariablesResolver,
	createTheme,
	localStorageColorSchemeManager,
} from "@mantine/core"

export const adminThemeStorageKey = "vicugna-admin-theme"

export const adminColorSchemeManager = localStorageColorSchemeManager({
	key: adminThemeStorageKey,
})

export const adminTheme = createTheme({
	primaryColor: "sage",
	primaryShade: { light: 6, dark: 4 },
	defaultRadius: "md",
	fontFamily:
		"Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
	colors: {
		sage: [
			"#f2f7ef",
			"#e3edde",
			"#c6dcc0",
			"#a8c99f",
			"#90b985",
			"#80ae75",
			"#6b9960",
			"#59804f",
			"#49673f",
			"#3b5533",
		],
	},
})

export const adminCssVariablesResolver: CSSVariablesResolver = () => ({
	variables: {},
	light: {
		"--mantine-color-body": "#f7f2e8",
		"--mantine-color-text": "#614731",
		"--mantine-color-dimmed": "#806a55",
		"--mantine-color-default": "#fffdf8",
		"--mantine-color-default-hover": "#f7f2e8",
		"--mantine-color-default-border": "#e5dac9",
	},
	dark: {
		"--mantine-color-body": "#29231e",
		"--mantine-color-text": "#f5ede3",
		"--mantine-color-dimmed": "#c7b9aa",
		"--mantine-color-default": "#1f1b17",
		"--mantine-color-default-hover": "#393027",
		"--mantine-color-default-border": "#493d32",
	},
})
