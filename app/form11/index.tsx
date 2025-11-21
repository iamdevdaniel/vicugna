import { router } from "expo-router"
import { Pressable, Text, View } from "react-native"

export default function Form11Home() {
	const handleNewShearing = () => {
		router.push("/form11/shearing-form")
	}

	return (
		<View style={{ flex: 1, padding: 20 }}>
			<Pressable
				style={{
					backgroundColor: "#007AFF",
					padding: 16,
					borderRadius: 8,
					alignItems: "center",
					marginBottom: 20,
				}}
				onPress={handleNewShearing}
			>
				<Text
					style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}
				>
					+ NUEVA ESQUILA
				</Text>
			</Pressable>

			{/* List will go here later */}
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
		</View>
	)
}
