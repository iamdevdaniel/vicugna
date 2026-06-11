import permits from "@assets/data/permits.json"
import type { AdminPermit } from "@definitions/types"
import { usePermitActions } from "@hooks"
import { ROUTES } from "@utils/constants"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { Alert, FlatList, View } from "react-native"
import { Button, Card, Text } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import { seedPermitBeforeCleaningRecords } from "../database/dev-seed"

const mockAdminPermit: AdminPermit[] = permits

// OVERVIEW /
export default function () {
	const { initializePermits } = usePermitActions()
	const [seeding, setSeeding] = useState(false)

	// TODO: implement path for permit init failure
	useEffect(() => {
		initializePermits(mockAdminPermit.map((p) => p.id))
	}, [initializePermits])

	const onSeed = async () => {
		setSeeding(true)
		try {
			await initializePermits(mockAdminPermit.map((p) => p.id))
			await seedPermitBeforeCleaningRecords(mockAdminPermit[0].id)
			Alert.alert("Seed listo", `Permiso ${mockAdminPermit[0].id}`)
		} catch {
			Alert.alert("Error", "No se pudo crear la data de prueba")
		} finally {
			setSeeding(false)
		}
	}

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<FlatList
				data={mockAdminPermit}
				keyExtractor={(item) => item.id}
				contentContainerStyle={{
					padding: 16,
					gap: 10,
				}}
				renderItem={({ item }) => (
					<Card
						style={{
							marginBottom: 10,
						}}
						onPress={() => router.push(ROUTES.OVERVIEW(item.id))}
					>
						<Card.Content>
							<Text variant="titleSmall">
								{item.codigoAutorizacion}
							</Text>
							<Text variant="bodyMedium">{item.site}</Text>
							<Text variant="bodySmall">{item.date}</Text>
						</Card.Content>
					</Card>
				)}
			/>
			{__DEV__ && (
				<View
					style={{
						position: "absolute",
						right: 16,
						bottom: 16,
					}}
				>
					<Button
						mode="contained-tonal"
						compact
						icon="database-plus"
						loading={seeding}
						disabled={seeding}
						onPress={onSeed}
					>
						Seed
					</Button>
				</View>
			)}
		</SafeAreaView>
	)
}
