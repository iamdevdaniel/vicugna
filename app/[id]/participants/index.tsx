import { useReadParticipants } from "@database"
import { ROUTES } from "@utils/constants"
import { useAppTheme } from "@utils/useAppTheme"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { FlatList, Text, View } from "react-native"
import { Card, FAB, IconButton } from "react-native-paper"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

// PARTICIPANTS.OVERVIEW /[id]/participants
export default function ParticipantsListScreen() {
	const theme = useAppTheme()
	const insets = useSafeAreaInsets()
	const { id } = useLocalSearchParams<{ id: string }>()
	const { data: participants } = useReadParticipants(id)

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: theme.colors.background }}
		>
			<Stack.Screen options={{ title: "Participantes" }} />
			<FlatList
				data={participants}
				keyExtractor={(participant) => participant.id}
				contentContainerStyle={{
					padding: 16,
					gap: 10,
				}}
				renderItem={({ item: participant }) => (
					<Card mode="elevated" style={{ marginBottom: 10 }}>
						<Card.Content style={{ flexDirection: "row" }}>
							<View style={{ flex: 1 }}>
								<Text>
									{participant.nombre} {participant.apellidos}
								</Text>
								<Text>{participant.cedulaIdentidad}</Text>
							</View>
							<IconButton
								icon="pencil"
								size={18}
								iconColor={theme.colors.custom.green}
								onPress={() =>
									router.push(
										ROUTES.PARTICIPANTS.FORM(
											id,
											participant.id,
										),
									)
								}
								style={{ margin: 0 }}
							/>
						</Card.Content>
					</Card>
				)}
			/>
			<FAB
				icon="plus"
				style={{
					position: "absolute",
					bottom: 24 + insets.bottom,
					right: 24,
				}}
				onPress={() => router.push(ROUTES.PARTICIPANTS.FORM(id, "new"))}
			/>
		</SafeAreaView>
	)
}
