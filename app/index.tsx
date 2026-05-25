import permits from "@assets/data/permits.json"
import { initializePermits } from "@database"
import type { AdminPermit } from "@definitions/types"
import { ROUTES } from "@utils/constants"
import { router } from "expo-router"
import { useEffect } from "react"
import { FlatList, StyleSheet } from "react-native"
import { Card, Text } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

const mockAdminPermit: AdminPermit[] = permits

// OVERVIEW /
export default function () {
	useEffect(() => {
		initializePermits(mockAdminPermit.map((p) => p.id))
	}, [])

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<FlatList
				data={mockAdminPermit}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.list}
				renderItem={({ item }) => (
					<Card
						style={styles.item}
						onPress={() => router.push(ROUTES.OVERVIEW(item.id))}
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
