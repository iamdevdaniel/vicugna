import { AccentCard, ReadOnlyNotice, StepList, TotalChip } from "@components"
import type { CleaningCommonData } from "@definitions/types"
import {
	useReadBulkCleaningCommon,
	useReadSingleCleaningHeader,
	useReadSingleDehearing,
	useReadSingleGrooming,
	useReadSinglePermit,
} from "@hooks"
import { ROUTES } from "@utils/constants"
import { useAppTheme } from "@utils/useAppTheme"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { ScrollView, Text, View } from "react-native"
import { Button, Icon } from "react-native-paper"
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
			? "PREDESC"
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
					justifyContent: "space-between",
				}}
			>
				<Text
					numberOfLines={1}
					ellipsizeMode="tail"
					style={{
						width: 88,
						textAlign: "left",
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
						paddingHorizontal: 8,
					}}
				>
					{status}
				</Text>
				<View
					style={{
						width: 86,
						alignItems: "flex-end",
						marginLeft: 8,
					}}
				>
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
						{isCompleted ? "Editar" : "Continuar"}
					</Button>
				</View>
			</View>
		</AccentCard>
	)
}

export default function () {
	const theme = useAppTheme()
	const insets = useSafeAreaInsets()
	const { permitId } = useLocalSearchParams<{
		permitId: string
		permitNumber?: string
	}>()
	const { data: permit } = useReadSinglePermit(permitId)
	const isPermitReadOnly = permit?.isSynced === true
	const { data: cleaningHeader } = useReadSingleCleaningHeader(permitId)
	const { data: cleaningCommon } = useReadBulkCleaningCommon(permitId)

	const headerState = cleaningHeader?.isCompleted ? "done" : "ready"
	const recordsState = cleaningCommon.length ? "done" : "ready"

	return (
		<SafeAreaView
			edges={["bottom"]}
			style={{ flex: 1, backgroundColor: theme.colors.background }}
		>
			<Stack.Screen options={{ title: "Limpieza" }} />
			<ScrollView
				contentContainerStyle={{
					paddingTop: 20,
					paddingHorizontal: 20,
					paddingBottom: 30 + insets.bottom,
					backgroundColor: "transparent",
				}}
				style={{ flex: 1 }}
			>
				{isPermitReadOnly && <ReadOnlyNotice />}
				<StepList
					steps={[
						{
							title: "Información general",
							state: headerState,
							action: {
								icon: "chevron-right",
								onPress: () =>
									router.push(
										ROUTES.CLEANUP.HEADER(permitId),
									),
							},
							details: cleaningHeader?.isCompleted ? (
								<View style={{ gap: 4 }}>
									<View
										style={{
											flexDirection: "row",
											alignItems: "center",
											gap: 8,
										}}
									>
										<Icon
											source="calendar-range"
											size={16}
											color={
												theme.colors.onSurfaceVariant
											}
										/>
										<Text
											style={{
												color: theme.colors
													.onSurfaceVariant,
											}}
										>
											{cleaningHeader.startDate} •{" "}
											{cleaningHeader.endDate}
										</Text>
									</View>
									<View
										style={{
											flexDirection: "row",
											alignItems: "center",
											gap: 8,
										}}
									>
										<Icon
											source="map-marker-outline"
											size={16}
											color={
												theme.colors.onSurfaceVariant
											}
										/>
										<Text
											style={{
												color: theme.colors
													.onSurfaceVariant,
											}}
										>
											{cleaningHeader.site}
										</Text>
									</View>
									<View
										style={{
											flexDirection: "row",
											alignItems: "center",
											gap: 8,
										}}
									>
										<Icon
											source="account-group-outline"
											size={16}
											color={
												theme.colors.onSurfaceVariant
											}
										/>
										<Text
											style={{
												color: theme.colors
													.onSurfaceVariant,
											}}
										>
											{cleaningHeader.supervisors}
										</Text>
									</View>
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
					disabled={isPermitReadOnly}
					onPress={() => router.push(ROUTES.CLEANUP.RECORD(permitId))}
				>
					Añadir registro
				</Button>
			</View>
		</SafeAreaView>
	)
}
