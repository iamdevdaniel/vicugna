import { useReadForm11Records } from "@database"
import { ROUTES } from "@utils/constants"
import { useAppTheme } from "@utils/useAppTheme"
import { router, useLocalSearchParams } from "expo-router"
import { useMemo } from "react"
import { ScrollView, View } from "react-native"
import { Card, Chip, FAB, Surface, Text } from "react-native-paper"
import { useSafeAreaInsets } from "react-native-safe-area-context"

// FORM11.RECORDS.LIST /form11/[id]/records
export default function () {
	const { permitId, id } = useLocalSearchParams<{
		permitId: string
		id: string
	}>()
	const theme = useAppTheme()
	const insets = useSafeAreaInsets()
	const { data: records, loading } = useReadForm11Records(id)

	const navigateToEdit = (recordId?: string) => {
		router.push(ROUTES.FORM11.RECORDS.EDIT(permitId, id, recordId))
	}

	const totalFibra = useMemo(
		() =>
			records.reduce(
				(sum, r) => sum + (parseFloat(r.pesoTotalFibra) || 0),
				0,
			),
		[records],
	)

	return (
		<View style={{ flex: 1, backgroundColor: theme.colors.background }}>
			<Surface elevation={2} style={{ padding: 16 }}>
				<Text
					variant="labelMedium"
					style={{ color: theme.colors.onSurfaceVariant }}
				>
					Total fibra acumulada
				</Text>
				<Text variant="headlineMedium">{totalFibra.toFixed(2)} kg</Text>
				<Text
					variant="bodySmall"
					style={{ color: theme.colors.onSurfaceVariant }}
				>
					{records.length}{" "}
					{records.length === 1 ? "registro" : "registros"}
				</Text>
			</Surface>
			<ScrollView
				contentContainerStyle={{
					padding: 16,
					paddingBottom: 96 + insets.bottom,
					flexGrow: 1,
				}}
				keyboardShouldPersistTaps="handled"
			>
				{!loading && records.length === 0 ? (
					<View
						style={{
							flex: 1,
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<Text
							variant="bodyMedium"
							style={{ color: theme.colors.onSurfaceVariant }}
						>
							No hay registros para esta esquila
						</Text>
					</View>
				) : (
					records.map((record, idx) => (
						<Card
							key={record.id ?? idx}
							onPress={() =>
								record.id && navigateToEdit(record.id)
							}
							style={{ marginBottom: 8 }}
						>
							<Card.Content style={{ paddingVertical: 10 }}>
								<Text
									variant="labelMedium"
									style={{
										color: theme.colors.onSurfaceVariant,
										marginBottom: 6,
									}}
								>
									#{idx + 1} · Ficha {record.tagId}
								</Text>
								<View
									style={{
										flexDirection: "row",
										flexWrap: "wrap",
										gap: 6,
									}}
								>
									<Chip
										compact
										style={{
											backgroundColor:
												theme.colors.custom.pastelBlue,
										}}
										textStyle={{
											color: theme.colors
												.onPrimaryContainer,
											fontSize: 11,
										}}
									>
										Bruto: {record.pesoFibraBruto} kg
									</Chip>
									<Chip
										compact
										style={{
											backgroundColor:
												theme.colors.custom
													.pastelYellow,
										}}
										textStyle={{
											color: theme.colors
												.onSecondaryContainer,
											fontSize: 11,
										}}
									>
										Limpio: {record.pesoVellonLimpio} kg
									</Chip>
									<Chip
										compact
										style={{
											backgroundColor:
												theme.colors.custom.pastelGreen,
										}}
										textStyle={{
											color: theme.colors
												.onTertiaryContainer,
											fontSize: 11,
										}}
									>
										Desc: {record.pesoFibraPredescerdada} kg
									</Chip>
								</View>
							</Card.Content>
						</Card>
					))
				)}
			</ScrollView>
			<FAB
				icon="plus"
				onPress={() => navigateToEdit()}
				style={{
					position: "absolute",
					right: 16,
					bottom: 16 + insets.bottom,
				}}
			/>
		</View>
	)
}
