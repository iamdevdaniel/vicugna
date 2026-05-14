import { useReadForm11Records } from "@database"
import { ROUTES } from "@utils/constants"
import { useAppTheme } from "@utils/useAppTheme"
import { router, useLocalSearchParams } from "expo-router"
import { ScrollView, View } from "react-native"
import { Card, Chip, FAB, Text } from "react-native-paper"
import { useSafeAreaInsets } from "react-native-safe-area-context"

// ROUTE /form11/[id]/records
export default function RecordsList() {
	const { id } = useLocalSearchParams<{ id: string }>()
	const theme = useAppTheme()
	const insets = useSafeAreaInsets()
	const { data: records, loading } = useReadForm11Records(id)

	const navigateToEdit = (recordId?: string) => {
		router.push(ROUTES.FORM11.RECORDS.EDIT(id, recordId))
	}

	return (
		<View style={{ flex: 1, backgroundColor: theme.colors.background }}>
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
							style={{ marginBottom: 12 }}
						>
							<Card.Content>
								<View
									style={{
										flexDirection: "row",
										justifyContent: "space-between",
										alignItems: "center",
										marginBottom: 8,
									}}
								>
									<Text variant="titleMedium">
										{record.ficha}
									</Text>
									<Chip
										compact
										style={{
											backgroundColor:
												record.caspa === "SI"
													? theme.colors.custom
															.crimson
													: theme.colors.custom.green,
										}}
										textStyle={{
											color: theme.colors.custom.white,
										}}
									>
										Caspa: {record.caspa}
									</Chip>
								</View>
								<Text
									variant="bodySmall"
									style={{
										color: theme.colors.onSurfaceVariant,
									}}
								>
									Fibra total: {record.pesoTotalFibra} kg
								</Text>
								<Text
									variant="bodySmall"
									style={{
										color: theme.colors.onSurfaceVariant,
									}}
								>
									Predescerdador:{" "}
									{record.nombrePredescerdador}
								</Text>
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
