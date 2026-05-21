import type { AdminPermit } from "@definitions/types"
import { ROUTES } from "@utils/constants"
import { router } from "expo-router"
import { FlatList, StyleSheet } from "react-native"
import { Card, Text } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

export const mockAdminPermit: AdminPermit[] = [
	{
		fechaCaptura: "2026-05-19",
		sitioCaptura: "Sora Sora Sector Norte",
		codigoAutorizacion: "AUT-2026-098A",
	},
	{
		fechaCaptura: "2026-05-20",
		sitioCaptura: "Cerro Calvario Alta",
		codigoAutorizacion: "AUT-2026-104B",
	},
	{
		fechaCaptura: "2026-05-22",
		sitioCaptura: "Bofedal Central Chachacomani",
		codigoAutorizacion: "AUT-2026-112C",
	},
]

// Route: /
export default function () {
	return (
		<SafeAreaView style={{ flex: 1 }}>
			<FlatList
				data={mockAdminPermit}
				keyExtractor={(item) => item.codigoAutorizacion}
				contentContainerStyle={styles.list}
				renderItem={({ item }) => (
					<Card
						style={styles.item}
						onPress={() =>
							router.push(
								ROUTES.PERMIT.DETAIL(item.codigoAutorizacion),
							)
						}
					>
						<Card.Content>
							<Text variant="titleSmall">
								{item.codigoAutorizacion}
							</Text>
							<Text variant="bodyMedium">
								{item.sitioCaptura}
							</Text>
							<Text variant="bodySmall">{item.fechaCaptura}</Text>
						</Card.Content>
					</Card>
				)}
			/>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	list: {
		padding: 16,
		gap: 10,
	},
	item: {
		marginBottom: 10,
	},
})
