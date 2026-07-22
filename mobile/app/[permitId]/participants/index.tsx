import { AccentCard } from "@components"
import { useReadBulkParticipants } from "@hooks"
import { ROUTES } from "@utils/constants"
import { useAppTheme } from "@utils/useAppTheme"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { FlatList, Text, View } from "react-native"
import { Button, Chip, Icon } from "react-native-paper"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

// PARTICIPANTS.OVERVIEW /[permitId]/participants

export default function () {
	const theme = useAppTheme()
	const insets = useSafeAreaInsets()
	const { permitId } = useLocalSearchParams<{ permitId: string }>()
	const { data: participants } = useReadBulkParticipants(permitId)

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
					justifyContent: "space-between",
					flexWrap: "wrap",
					gap: 10,
					marginBottom: 12,
					marginTop: 8,
					marginHorizontal: 16,
				}}
			>
				<Chip
					compact
					style={{ backgroundColor: theme.colors.surfaceVariant }}
				>
					Total {total}
				</Chip>
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						gap: 10,
					}}
				>
					<Chip
						compact
						icon={({ size }) => (
							<Icon
								source="human-female"
								size={size}
								color={theme.colors.custom.pink}
							/>
						)}
						style={{ backgroundColor: "#FCE7F3" }}
						showSelectedCheck={false}
						textStyle={{
							color: theme.colors.custom.pink,
							fontWeight: "700",
						}}
					>
						{femaleCount}
					</Chip>
					<Chip
						compact
						icon={({ size }) => (
							<Icon
								source="human-male"
								size={size}
								color={theme.colors.custom.blue}
							/>
						)}
						style={{ backgroundColor: "#DBEAFE" }}
						showSelectedCheck={false}
						textStyle={{
							color: theme.colors.custom.blue,
							fontWeight: "700",
						}}
					>
						{maleCount}
					</Chip>
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
					<AccentCard
						accent={
							participant.gender === "M"
								? theme.colors.custom.blue
								: theme.colors.custom.pink
						}
						prefix={index + 1}
						onPress={() =>
							router.push(
								ROUTES.PARTICIPANTS.FORM(
									permitId,
									participant.id,
								),
							)
						}
					>
						<View
							style={{
								justifyContent: "center",
								paddingVertical: 6,
							}}
						>
							<Text style={{ fontWeight: "bold" }}>
								{participant.name} {participant.lastNames}
							</Text>
							<Text>{participant.identityNumber}</Text>
						</View>
					</AccentCard>
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
						router.push(ROUTES.PARTICIPANTS.FORM(permitId, "new"))
					}
				>
					Añadir participante
				</Button>
			</View>
		</SafeAreaView>
	)
}
