import { AccentCard, StepList } from "@components"
import { useReadBulkCleaningCommon, useReadSingleCleaningHeader } from "@hooks"
import { ROUTES } from "@utils/constants"
import { useAppTheme } from "@utils/useAppTheme"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { ScrollView, Text, View } from "react-native"
import { Button } from "react-native-paper"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

export default function () {
	const theme = useAppTheme()
	const insets = useSafeAreaInsets()
	const { permitId } = useLocalSearchParams<{ permitId: string }>()
	const { data: cleaningHeader } = useReadSingleCleaningHeader(permitId)
	const { data: cleaningCommon } = useReadBulkCleaningCommon(permitId)

	const headerState = cleaningHeader?.isCompleted ? "done" : "ready"
	const recordsState = cleaningCommon.length ? "done" : "ready"

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: theme.colors.background }}
		>
			<Stack.Screen options={{ title: `Permiso ${permitId || ""}` }} />
			<ScrollView
				contentContainerStyle={{
					paddingHorizontal: 20,
					backgroundColor: "transparent",
				}}
				style={{ flex: 1 }}
			>
				<StepList
					steps={[
						{
							title: "Información general",
							state: headerState,
							action: {
								icon: "pencil",
								onPress: () =>
									router.push(
										ROUTES.CLEANUP.HEADER(permitId),
									),
							},
							details: cleaningHeader?.isCompleted ? (
								<View style={{ gap: 4 }}>
									<Text>
										Inicio: {cleaningHeader.startDate}
									</Text>
									<Text>
										Conclusión: {cleaningHeader.endDate}
									</Text>
									<Text>Lugar: {cleaningHeader.site}</Text>
									<Text>
										Responsables:{" "}
										{cleaningHeader.supervisors}
									</Text>
								</View>
							) : null,
						},
						{
							title: "Registros de limpieza",
							state: recordsState,
							details: (
								<View style={{ gap: 8 }}>
									<Text>Total: {cleaningCommon.length}</Text>
									{cleaningCommon.map((record, index) => (
										<AccentCard
											key={record.id}
											accent={theme.colors.tertiary}
											prefix={index + 1}
											style={{
												backgroundColor:
													theme.colors.surfaceVariant,
											}}
										>
											<View
												style={{
													paddingRight: 4,
													paddingVertical: 6,
												}}
											>
												<Text>
													Registro {index + 1}
												</Text>
											</View>
										</AccentCard>
									))}
								</View>
							),
						},
					]}
				/>
			</ScrollView>
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
					onPress={() => router.push(ROUTES.CLEANUP.RECORD(permitId))}
				>
					Añadir registro
				</Button>
			</View>
		</SafeAreaView>
	)
}
