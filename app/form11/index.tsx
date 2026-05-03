import regionales from "@assets/data/regionales.json"
import { readAllShearingForms } from "@database"
import type { Form11Shearing, Form11Storage } from "@definitions/types"
import { router, useFocusEffect } from "expo-router"
import { useCallback, useState } from "react"
import { Text, View } from "react-native"
import { Button, Card, useTheme } from "react-native-paper"

const getRegionalName = (form: Form11Shearing): string => {
	return (
		regionales[
			form.departamento as keyof typeof regionales
		].regionales.find((r) => r.id === form.asociacionRegional)?.nombre ||
		"NA"
	)
}

const getCommunityName = (form: Form11Shearing): string => {
	const departamento =
		regionales[form.departamento as keyof typeof regionales]
	if (!departamento) return "NA"
	const regional = departamento.regionales.find((r) =>
		r.comunidades.some((c) => c.id === form.comunidadManejadora),
	)
	if (!regional) return "NA"
	const comunidad = regional.comunidades.find(
		(c) => c.id === form.comunidadManejadora,
	)
	return comunidad?.nombre || "NA"
}

export default function Form11Home() {
	const handleNewShearing = () => {
		router.push("/form11/shearing-form")
	}

	const [forms, setForms] = useState<Form11Storage[]>([])

	useFocusEffect(
		useCallback(() => {
			readAllShearingForms().then(setForms)
		}, []),
	)

	console.log("-----------")

	const theme = useTheme()

	return (
		<View style={{ flex: 1, padding: 20 }}>
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
						style={{
							marginBottom: 20,
							borderRadius: 16,
							backgroundColor: theme.colors.surface,
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
		</View>
	)
}
