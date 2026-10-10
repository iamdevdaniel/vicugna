import { ThemeProvider as NavigationThemeProvider } from "@react-navigation/native"
import { useActiveThemeMode } from "@utils/settings-store"
import { appThemes } from "@utils/themes"
import { Stack } from "expo-router"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { PaperProvider } from "react-native-paper"

export default function NativeAppLayout() {
	const themeMode = useActiveThemeMode()
	const theme = appThemes[themeMode]

	return (
		<GestureHandlerRootView
			style={{
				flex: 1,
				backgroundColor: theme.navigation.colors.background,
			}}
		>
			<PaperProvider theme={theme.paper}>
				<NavigationThemeProvider value={theme.navigation}>
					<Stack
						screenOptions={{
							statusBarStyle: theme.statusBarStyle,
							headerTitleStyle: {
								fontSize: 15,
							},
						}}
					>
						<Stack.Screen
							name="index"
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name="login"
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name="[permitId]"
							options={{ headerShown: false }}
						/>
					</Stack>
				</NavigationThemeProvider>
			</PaperProvider>
		</GestureHandlerRootView>
	)
}
