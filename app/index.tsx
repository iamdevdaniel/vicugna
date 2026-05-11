import { ROUTES } from "@utils/constants"
import { type Route, useRouter } from "expo-router"
import { Pressable, Text, View } from "react-native"

// Route: /
export default function () {
	const router = useRouter()

	return (
		<View
			style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
		>
			<Pressable
				style={{
					backgroundColor: "#007AFF",
					padding: 20,
					borderRadius: 10,
				}}
				onPress={() => router.push(ROUTES.FORM11.LIST as Route)}
			>
				<Text
					style={{ color: "white", fontSize: 18, fontWeight: "bold" }}
				>
					CREATE NEW RECORD
				</Text>
			</Pressable>
		</View>
	)
}
