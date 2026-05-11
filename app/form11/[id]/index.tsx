import { ROUTES } from "@utils/constants"
import { useAppTheme } from "@utils/useAppTheme"
import { type Route, router, Stack, useLocalSearchParams } from "expo-router"
import { Pressable, ScrollView, Text, View } from "react-native"

const OverviewStep = ({
	number,
	title,
	onPress,
}: {
	number: number
	title: string
	onPress: () => void
}) => {
	const theme = useAppTheme()
	return (
		<Pressable
			onPress={onPress}
			style={{
				flexDirection: "row",
				alignItems: "center",
				backgroundColor: theme.colors.surface,
				padding: 16,
				borderRadius: 12,
				marginBottom: 12,
				borderWidth: 1,
				borderColor: theme.colors.outlineVariant,
			}}
		>
			<View
				style={{
					backgroundColor: theme.colors.custom.green,
					width: 32,
					height: 32,
					borderRadius: 4,
					justifyContent: "center",
					alignItems: "center",
					marginRight: 16,
				}}
			>
				<Text
					style={{
						color: theme.colors.custom.white,
						fontSize: 16,
						fontWeight: "bold",
					}}
				>
					{number}
				</Text>
			</View>
			<Text
				style={{
					fontSize: 16,
					fontWeight: "bold",
					color: theme.colors.onSurface,
					flex: 1,
				}}
			>
				{title}
			</Text>
		</Pressable>
	)
}

// ROUTE form11/[id]
export default function Form11Overview() {
	const theme = useAppTheme()
	const { id } = useLocalSearchParams()

	return (
		<View style={{ flex: 1, backgroundColor: theme.colors.background }}>
			<Stack.Screen options={{ title: `Formulario ${id || ""}` }} />
			<ScrollView
				contentContainerStyle={{ padding: 20 }}
				style={{ flex: 1 }}
			>
				<OverviewStep
					number={1}
					title="Captura / Esquila"
					onPress={() =>
						router.push(
							ROUTES.FORM11.SHEARING.OVERVIEW.replace(
								"[id]",
								id as string,
							) as Route,
						)
					}
				/>
				<OverviewStep
					number={2}
					title="Procesamiento / Predescerdado"
					onPress={() =>
						router.push(
							ROUTES.FORM11.DEHEARING.OVERVIEW.replace(
								"[id]",
								id as string,
							) as Route,
						)
					}
				/>
				<OverviewStep
					number={3}
					title="Registros / Listado"
					onPress={() =>
						router.push(
							ROUTES.FORM11.RECORDS.LIST.replace(
								"[id]",
								id as string,
							) as Route,
						)
					}
				/>
			</ScrollView>
		</View>
	)
}
