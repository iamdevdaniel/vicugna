import {
	ActionIcon,
	useComputedColorScheme,
	useMantineColorScheme,
} from "@mantine/core"

export function ThemeToggle() {
	const computedColorScheme = useComputedColorScheme("light")
	const { setColorScheme } = useMantineColorScheme()
	const nextScheme = computedColorScheme === "dark" ? "light" : "dark"

	return (
		<ActionIcon
			variant="subtle"
			size="lg"
			aria-label={`Cambiar al tema ${nextScheme === "dark" ? "oscuro" : "claro"}`}
			onClick={() => setColorScheme(nextScheme)}
		>
			<span aria-hidden="true">
				{computedColorScheme === "dark" ? "☀" : "☾"}
			</span>
		</ActionIcon>
	)
}
