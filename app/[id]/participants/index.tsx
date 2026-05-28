import { useReadParticipants } from "@database"
import { ROUTES } from "@utils/constants"
import { useAppTheme } from "@utils/useAppTheme"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { FlatList, Text, View } from "react-native"
import { Button, Card, IconButton } from "react-native-paper"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

// PARTICIPANTS.OVERVIEW /[id]/participants
export default function () {
	const theme = useAppTheme()
	const insets = useSafeAreaInsets()
	const { id } = useLocalSearchParams<{ id: string }>()
	const { data: participants } = useReadParticipants(id)

	const total = participants?.length || 0
	const maleCount = participants?.filter((p) => p.gender === "M").length || 0
	const femaleCount =
		participants?.filter((p) => p.gender === "F").length || 0

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
					paddingBottom: 40 + insets.bottom,
				}}
				renderItem={({ item: participant, index }) => (
					<Card
						mode="elevated"
						style={{
							marginBottom: 0,
							borderRadius: 8,
							borderLeftWidth: 0,
							overflow: "hidden",
							position: "relative",
						}}
					>
						<View
							style={{
								position: "absolute",
								left: 0,
								top: 0,
								bottom: 0,
								width: 32,
								backgroundColor:
									participant.gender === "M"
										? theme.colors.custom.blue
										: theme.colors.custom.pink,
								justifyContent: "center",
								alignItems: "center",
								zIndex: 1,
							}}
						>
							<Text
								style={{
									color: theme.colors.custom.white,
									fontWeight: "bold",
									fontSize: 16,
									opacity: 0.8,
								}}
							>
								{index + 1}
							</Text>
						</View>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								paddingLeft: 40,
								paddingRight: 4,
								paddingVertical: 6,
							}}
						>
							<View style={{ flex: 1 }}>
								<Text style={{ fontWeight: "bold" }}>
									{participant.name} {participant.lastNames}
								</Text>
								<Text>{participant.identityNumber}</Text>
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
						</View>
					</Card>
				)}
			/>
			<View
				style={{
					position: "absolute",
					left: 0,
					right: 0,
					bottom: 0,
					padding: 16,
					paddingBottom: 16 + insets.bottom,
					backgroundColor: theme.colors.background,
				}}
			>
				<Button
					mode="contained"
					icon="plus"
					contentStyle={{ height: 48 }}
					onPress={() =>
						router.push(ROUTES.PARTICIPANTS.FORM(id, "new"))
					}
				>
					Añadir participante
				</Button>
			</View>
		</SafeAreaView>
	)
}
