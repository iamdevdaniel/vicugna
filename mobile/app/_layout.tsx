import { HeaderBreadcrumb } from "@components"
import { warm } from "@utils/themes"
import { Stack } from "expo-router"
import { useColorScheme } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper"

function permitHeader(params: unknown, parts: string[]) {
	const { permitNumber } = params as { permitNumber: string }

	return {
		headerTitle: () => (
			<HeaderBreadcrumb parts={[permitNumber, ...parts]} />
		),
	}
}

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
				<Stack
					screenOptions={{
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
							permitHeader(route.params, ["Registro de fibra"])
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
							permitHeader(route.params, ["Registro de fibra"])
						}
					/>
				</Stack>
			</PaperProvider>
		</GestureHandlerRootView>
	)
}
