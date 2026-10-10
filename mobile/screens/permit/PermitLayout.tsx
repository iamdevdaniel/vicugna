import { HeaderBreadcrumb } from "@components"
import { useActiveThemeMode } from "@utils/settings-store"
import { appThemes } from "@utils/themes"
import { Stack } from "expo-router"
import PermitRouteGuard from "./PermitRouteGuard"

function permitHeader(params: unknown, parts: string[]) {
	const { permitNumber } = params as { permitNumber: string }

	return {
		headerTitle: () => (
			<HeaderBreadcrumb parts={[permitNumber, ...parts]} />
		),
	}
}

export default function NativePermitLayout() {
	const themeMode = useActiveThemeMode()
	const theme = appThemes[themeMode]

	return (
		<PermitRouteGuard>
			<Stack
				screenOptions={{
					statusBarStyle: theme.statusBarStyle,
					headerTitleStyle: { fontSize: 15 },
				}}
			>
				<Stack.Screen name="index" options={{ title: "Permiso" }} />
				<Stack.Screen
					name="participants/index"
					options={({ route }) =>
						permitHeader(route.params, ["Participantes"])
					}
				/>
				<Stack.Screen
					name="participants/[participantId]"
					options={({ route }) =>
						permitHeader(route.params, ["Participantes"])
					}
				/>
				<Stack.Screen
					name="shearing/index"
					options={({ route }) =>
						permitHeader(route.params, ["Esquila"])
					}
				/>
				<Stack.Screen
					name="shearing/header"
					options={({ route }) =>
						permitHeader(route.params, [
							"Esquila",
							"Información general",
						])
					}
				/>
				<Stack.Screen
					name="shearing/record"
					options={({ route }) =>
						permitHeader(route.params, [
							"Esquila",
							"Registro de esquila",
						])
					}
				/>
				<Stack.Screen
					name="cleanup/index"
					options={({ route }) =>
						permitHeader(route.params, ["Registro de fibra"])
					}
				/>
				<Stack.Screen
					name="cleanup/header"
					options={({ route }) =>
						permitHeader(route.params, [
							"Registro de fibra",
							"Información general",
						])
					}
				/>
				<Stack.Screen
					name="cleanup/record"
					options={({ route }) =>
						permitHeader(route.params, ["Registro de fibra"])
					}
				/>
			</Stack>
		</PermitRouteGuard>
	)
}
