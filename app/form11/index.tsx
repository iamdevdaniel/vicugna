import { readAllForm11 } from "@database"
import type { Form11Storage } from "@definitions/types"
import { ROUTES } from "@utils/constants"
import { getCommunityName, getRegionalName } from "@utils/regional-lookup"
import { type Route, router, useFocusEffect } from "expo-router"
import { useCallback, useState } from "react"
import { ScrollView, Text, View } from "react-native"
import { Button, Card, useTheme } from "react-native-paper"

// ROUTE form11
export default function () {
	const theme = useTheme()

	const handleNewShearing = () => {
		router.push(ROUTES.FORM11.SHEARING as Route)
	}

	const [forms, setForms] = useState<Form11Storage[]>([])

	useFocusEffect(
		useCallback(() => {
			readAllForm11().then(setForms)
		}, []),
	)

	return (
		<ScrollView
			style={{ flex: 1 }}
			contentContainerStyle={{
				padding: 20,
				paddingBottom: 40,
				flexGrow: 1,
			}}
			keyboardShouldPersistTaps="handled"
		>
			<Button
				mode="contained"
				onPress={handleNewShearing}
				style={{
					marginBottom: 20,
					borderRadius: 8,
				}}
				contentStyle={{
					paddingVertical: 8,
				}}
				labelStyle={{
					fontSize: 16,
					fontWeight: "bold",
				}}
			>
				+ NUEVA ESQUILA
			</Button>

			{forms.length === 0 ? (
				<View
					style={{
						flex: 1,
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<Text
						style={{ color: theme.colors.onSurface, fontSize: 14 }}
					>
						No hay esquilas registradas
					</Text>
				</View>
			) : (
				forms.map((form, idx) => (
					<Card
						key={form.id || idx}
						onPress={() => {
							console.log("to", form.id)
							router.push(`/form11/${form.id || idx}` as Route)
						}}
						style={{
							marginBottom: 20,
							borderRadius: 16,
							elevation: 2,
						}}
					>
						<Card.Content>
							<View
								style={{
									flexDirection: "row",
									alignItems: "flex-start",
								}}
							>
								<View style={{ flex: 1 }}>
									<Text
										style={{
											fontWeight: "bold",
											fontSize: 16,
											color: theme.colors.onSurface,
											marginBottom: 6,
										}}
									>
										{form.shearing.fechaCaptura}
									</Text>
									<Text
										style={{
											fontSize: 12,
											color: theme.colors.onSurface,
											marginBottom: 6,
										}}
									>
										Regional:{" "}
										{getRegionalName(form.shearing)}
									</Text>
									<Text
										style={{
											fontSize: 12,
											color: theme.colors
												.onSurfaceVariant,
										}}
									>
										Comunidad:{" "}
										{getCommunityName(form.shearing)}
									</Text>
								</View>
								<View
									style={{
										justifyContent: "space-between",
										alignItems: "center",
										marginLeft: 12,
										alignSelf: "stretch",
									}}
								>
									<View
										style={{
											backgroundColor:
												theme.colors.primary,
											borderRadius: 999,
											width: 40,
											height: 40,
											justifyContent: "center",
											alignItems: "center",
										}}
									>
										<Text
											style={{
												color: theme.colors.onPrimary,
												fontWeight: "bold",
												fontSize: 16,
											}}
										>
											{form.records?.length || 0}
										</Text>
									</View>
									<Text style={{ fontSize: 12 }}>
										REGISTROS
									</Text>
								</View>
							</View>
						</Card.Content>
					</Card>
				))
			)}
		</ScrollView>
	)
}
