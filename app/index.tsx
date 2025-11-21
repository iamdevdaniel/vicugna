import { useRouter } from "expo-router"
import { Pressable, Text, View } from "react-native"
import { enGB, registerTranslation } from "react-native-paper-dates"

export default function Index() {
	const router = useRouter()
	registerTranslation("en-GB", enGB)

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
				onPress={() => router.push("/form11")}
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
