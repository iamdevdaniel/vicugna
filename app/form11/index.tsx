import { readAllShearingForms } from "@database"
import type { Form11Storage } from "@definitions/types"
import { router, useFocusEffect } from "expo-router"
import { useState } from "react"
import { Text, View } from "react-native"
import { Button } from "react-native-paper"

export default function Form11Home() {
	const handleNewShearing = () => {
		router.push("/form11/shearing-form")
	}

	const [forms, setForms] = useState<Form11Storage[]>([])

	useFocusEffect(() => {
		readAllShearingForms().then(setForms)
	})

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
					<Text style={{ color: "#666", fontSize: 14 }}>
						No hay esquilas registradas
					</Text>
				</View>
			) : (
				forms.map((form, idx) => (
					<View key={form.id || idx} style={{ marginBottom: 16 }}>
						<Text>Fecha: {form.shearing.fechaCaptura}</Text>
						<Text>
							Regional: {form.shearing.asociacionRegional}
						</Text>
						<Text>
							Comunidad: {form.shearing.comunidadManejadora}
						</Text>
						<Text>Sitio Captura: {form.shearing.sitioCaptura}</Text>
						<Text>Registros: {form.records?.length || 0}</Text>
					</View>
				))
			)}
		</View>
	)
}
