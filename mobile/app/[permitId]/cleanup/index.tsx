import { AccentCard, StepList, TotalChip } from "@components"
import type { CleaningCommonData } from "@definitions/types"
import {
	useReadBulkCleaningCommon,
	useReadSingleCleaningHeader,
	useReadSingleDehearing,
	useReadSingleGrooming,
} from "@hooks"
import { ROUTES } from "@utils/constants"
import { useAppTheme } from "@utils/useAppTheme"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { ScrollView, Text, View } from "react-native"
import { Button } from "react-native-paper"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

function CleaningRecordCard({
	index,
	permitId,
	record,
}: {
	index: number
	permitId: string
	record: CleaningCommonData
}) {
	const theme = useAppTheme()
	const { data: grooming } = useReadSingleGrooming(record.id)
	const { data: dehearing } = useReadSingleDehearing(record.id)
	const isGroomingCompleted = grooming?.isCompleted === true
	const isDehearingCompleted = dehearing?.isCompleted === true
	const isCompleted = isGroomingCompleted || isDehearingCompleted
	const accent = isCompleted
		? theme.colors.custom.green
		: theme.colors.custom.blue
	const status = isGroomingCompleted
		? "LIMPIADO"
		: isDehearingCompleted
			? "PREDESCERDADO"
			: "PENDIENTE"

	return (
		<AccentCard
			key={record.id}
			accent={accent}
			prefix={index + 1}
			style={{
				backgroundColor: theme.colors.surfaceVariant,
			}}
		>
			<View
				style={{
					minHeight: 48,
					paddingLeft: 4,
					paddingRight: 6,
					paddingVertical: 6,
					flexDirection: "row",
					alignItems: "center",
				}}
			>
				<View
					style={{
						flex: 1,
						flexDirection: "row",
						alignItems: "center",
					}}
				>
					<Text
						style={{
							flex: 1,
							textAlign: "center",
							color: theme.colors.onSurface,
						}}
					>
						{record.fleeceNumber}
					</Text>
					<Text
						style={{
							flex: 1,
							textAlign: "center",
							color: accent,
							fontSize: 11,
							fontWeight: "600",
						}}
					>
						{status}
					</Text>
				</View>
				<View style={{ width: 86, alignItems: "flex-end" }}>
					<Button
						mode="outlined"
						compact
						textColor={accent}
						style={{
							width: 74,
							borderColor: accent,
							borderRadius: 6,
						}}
						contentStyle={{
							height: 32,
							paddingHorizontal: 0,
							alignItems: "center",
							justifyContent: "center",
						}}
						labelStyle={{
							fontSize: 11,
							fontWeight: "700",
							marginHorizontal: 0,
							marginVertical: 0,
							lineHeight: 14,
						}}
						onPress={() =>
							router.push(
								ROUTES.CLEANUP.DETAILS(permitId, record.id),
							)
						}
					>
						{isCompleted ? "Editar" : "Seguir"}
					</Button>
				</View>
			</View>
		</AccentCard>
	)
}

export default function () {
	const theme = useAppTheme()
	const insets = useSafeAreaInsets()
	const { permitId, permitNumber } = useLocalSearchParams<{
		permitId: string
		permitNumber?: string
	}>()
	const { data: cleaningHeader } = useReadSingleCleaningHeader(permitId)
	const { data: cleaningCommon } = useReadBulkCleaningCommon(permitId)

	const headerState = cleaningHeader?.isCompleted ? "done" : "ready"
	const recordsState = cleaningCommon.length ? "done" : "ready"

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: theme.colors.background }}
		>
			<Stack.Screen
				options={{ title: `Permiso ${permitNumber ?? "sin número"}` }}
			/>
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
									<TotalChip total={cleaningCommon.length} />
									{cleaningCommon.map((record, index) => (
										<CleaningRecordCard
											key={record.id}
											index={index}
											permitId={permitId}
											record={record}
										/>
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
