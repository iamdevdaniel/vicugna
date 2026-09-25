import { useComputedColorScheme, useMantineColorScheme } from "@mantine/core"
import { useNavigation } from "react-router"

export function useShellState() {
	const navigation = useNavigation()
	const computedColorScheme = useComputedColorScheme("light")
	const { setColorScheme } = useMantineColorScheme()

	return {
		isNavigating: navigation.state !== "idle",
		toggleTheme: () =>
			setColorScheme(computedColorScheme === "dark" ? "light" : "dark"),
	}
}
