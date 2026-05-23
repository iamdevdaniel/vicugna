import { warm } from "@utils/themes"
import { Stack } from "expo-router"
import { useColorScheme } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper"

export default function RootLayout() {
	const lightTheme = {
		...MD3LightTheme,
		colors: { ...MD3LightTheme.colors, ...warm.light },
	}
	const darkTheme = {
		...MD3DarkTheme,
		colors: { ...MD3DarkTheme.colors, ...warm.dark },
	}
	const colorScheme = useColorScheme()
	const theme = colorScheme === "light" ? lightTheme : darkTheme

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<PaperProvider theme={theme}>
				<Stack>
					<Stack.Screen
						name="index"
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="form11/index"
						// options={{ title: "Nuevo registro formulario 11" }}
					/>
				</Stack>
			</PaperProvider>
		</GestureHandlerRootView>
	)
}
