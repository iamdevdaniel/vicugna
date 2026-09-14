import { HeaderBreadcrumb } from "@components"
import { ThemeProvider as NavigationThemeProvider } from "@react-navigation/native"
import { useActiveThemeMode } from "@utils/settings-store"
import { appThemes } from "@utils/themes"
import { Stack } from "expo-router"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { PaperProvider } from "react-native-paper"

function permitHeader(params: unknown, parts: string[]) {
	const { permitNumber } = params as { permitNumber: string }

	return {
		headerTitle: () => (
			<HeaderBreadcrumb parts={[permitNumber, ...parts]} />
		),
	}
}

export default function RootLayout() {
	const themeMode = useActiveThemeMode()
	const theme = appThemes[themeMode]

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
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
							name="[permitId]/index"
							options={{ title: "Permiso" }}
						/>
						<Stack.Screen
							name="[permitId]/participants/index"
							options={({ route }) =>
								permitHeader(route.params, ["Participantes"])
							}
						/>
						<Stack.Screen
							name="[permitId]/participants/[participantId]"
							options={({ route }) =>
								permitHeader(route.params, ["Participantes"])
							}
						/>
						<Stack.Screen
							name="[permitId]/shearing/index"
							options={({ route }) =>
								permitHeader(route.params, ["Esquila"])
							}
						/>
						<Stack.Screen
							name="[permitId]/shearing/header"
							options={({ route }) =>
								permitHeader(route.params, [
									"Esquila",
									"Información general",
								])
							}
						/>
						<Stack.Screen
							name="[permitId]/shearing/record"
							options={({ route }) =>
								permitHeader(route.params, [
									"Esquila",
									"Registro de esquila",
								])
							}
						/>
						<Stack.Screen
							name="[permitId]/cleanup/index"
							options={({ route }) =>
								permitHeader(route.params, [
									"Registro de fibra",
								])
							}
						/>
						<Stack.Screen
							name="[permitId]/cleanup/header"
							options={({ route }) =>
								permitHeader(route.params, [
									"Registro de fibra",
									"Información general",
								])
							}
						/>
						<Stack.Screen
							name="[permitId]/cleanup/record"
							options={({ route }) =>
								permitHeader(route.params, [
									"Registro de fibra",
								])
							}
						/>
					</Stack>
				</NavigationThemeProvider>
			</PaperProvider>
		</GestureHandlerRootView>
	)
}
