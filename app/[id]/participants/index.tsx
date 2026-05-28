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

	const total = participants?.length || 0
	const maleCount = participants?.filter((p) => p.genero === "M").length || 0
	const femaleCount =
		participants?.filter((p) => p.genero === "F").length || 0

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: theme.colors.background }}
		>
			<Stack.Screen options={{ title: "Participantes" }} />
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					gap: 16,
					marginBottom: 12,
					marginTop: 8,
					marginHorizontal: 16,
				}}
			>
				<Text style={{ fontWeight: "bold", fontSize: 16 }}>
					Total: {total}
				</Text>
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						gap: 6,
					}}
				>
					<IconButton
						icon="human-male"
						size={20}
						iconColor={theme.colors.custom.blue}
						style={{ margin: 0 }}
					/>
					<Text>{maleCount}</Text>
				</View>
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						gap: 6,
					}}
				>
					<IconButton
						icon="human-female"
						size={20}
						iconColor={theme.colors.custom.pink}
						style={{ margin: 0 }}
					/>
					<Text>{femaleCount}</Text>
				</View>
			</View>
			<FlatList
				data={participants}
				keyExtractor={(participant) => participant.id}
				contentContainerStyle={{
					padding: 16,
					gap: 10,
				}}
				renderItem={({ item: participant }) => (
					<Card
						mode="elevated"
						style={{
							marginBottom: 10,
							borderRadius: 8,
							borderLeftWidth: 6,
							borderLeftColor:
								participant.genero === "M"
									? theme.colors.custom.blue
									: theme.colors.custom.pink,
						}}
					>
						<Card.Content
							style={{
								flexDirection: "row",
								alignItems: "center",
								paddingHorizontal: 8,
								paddingVertical: 8,
							}}
						>
							<View style={{ flex: 1 }}>
								<Text style={{ fontWeight: "bold" }}>
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
