import { StepList, type StepState, TotalChip } from "@components"
import {
	useReadBulkCleaningCommon,
	useReadBulkDehearing,
	useReadBulkGrooming,
	useReadBulkParticipants,
	useReadBulkShearingRecords,
	useReadSingleCleaningHeader,
	useReadSinglePermit,
	useSyncPermit,
} from "@hooks"
import { ROUTES } from "@utils/constants"
import { getDependentStepState } from "@utils/misc"
import { getCommunityName } from "@utils/regionals"
import { useAppTheme } from "@utils/useAppTheme"
import { router, Stack, useLocalSearchParams, useNavigation } from "expo-router"
import { useEffect, useRef, useState } from "react"
import {
	Alert,
	Animated,
	BackHandler,
	ScrollView,
	Text,
	View,
} from "react-native"
import {
	ActivityIndicator,
	Button,
	Icon,
	Modal,
	Portal,
	Snackbar,
} from "react-native-paper"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

// OVERVIEW /[permitId]
export default function () {
	const theme = useAppTheme()
	const insets = useSafeAreaInsets()
	const navigation = useNavigation()
	const snackbarTranslateY = useRef(new Animated.Value(80)).current
	const [snackbarVisible, setSnackbarVisible] = useState(false)
	const [snackbarMessage, setSnackbarMessage] = useState("")
	const [snackbarType, setSnackbarType] = useState<"success" | "error">(
		"success",
	)
	const { permitId, permitNumber } = useLocalSearchParams<{
		permitId: string
		permitNumber?: string
	}>()
	const { data: permit } = useReadSinglePermit(permitId)
	const { data: participants } = useReadBulkParticipants(permitId)
	const { data: records } = useReadBulkShearingRecords(permitId)
	const { data: cleaningHeader } = useReadSingleCleaningHeader(permitId)
	const { data: cleaningRecords } = useReadBulkCleaningCommon(permitId)
	const {
		syncPermit,
		syncingPermit,
		clearError: clearSyncError,
	} = useSyncPermit()
	const cleaningRecordIds = cleaningRecords.map((record) => record.id)
	const { data: groomingRecords } = useReadBulkGrooming(cleaningRecordIds)
	const { data: dehearingRecords } = useReadBulkDehearing(cleaningRecordIds)

	const participantsState: StepState =
		participants.length > 0 ? "done" : "ready"
	const shearingState = getDependentStepState(
		participantsState === "done",
		records.length > 0,
	)
	const completedCleaningRecordIds = new Set([
		...groomingRecords
			.filter((record) => record.isCompleted)
			.map((record) => record.cleaningCommonId),
		...dehearingRecords
			.filter((record) => record.isCompleted)
			.map((record) => record.cleaningCommonId),
	])
	const cleaningRecordsCompleted =
		cleaningRecords.length > 0 &&
		cleaningRecords.every((record) =>
			completedCleaningRecordIds.has(record.id),
		)
	const cleaningState = getDependentStepState(
		shearingState === "done",
		cleaningHeader?.isCompleted === true && cleaningRecordsCompleted,
	)
	const canSendPermit =
		participantsState === "done" &&
		shearingState === "done" &&
		cleaningState === "done"
	const isPermitSynced = permit?.isSynced === true
	const communityName = permit
		? getCommunityName(permit.communityId)
		: "Comunidad"

	useEffect(() => {
		Animated.timing(snackbarTranslateY, {
			toValue: snackbarVisible ? 0 : 80,
			duration: 180,
			useNativeDriver: true,
		}).start()
	}, [snackbarTranslateY, snackbarVisible])

	useEffect(() => {
		if (!syncingPermit) {
			return
		}

		const backHandlerSubscription = BackHandler.addEventListener(
			"hardwareBackPress",
			() => true,
		)
		const beforeRemoveSubscription = navigation.addListener(
			"beforeRemove",
			(event) => {
				event.preventDefault()
			},
		)

		return () => {
			backHandlerSubscription.remove()
			beforeRemoveSubscription()
		}
	}, [navigation, syncingPermit])

	const hideSnackbar = () => {
		setSnackbarVisible(false)
	}

	const showSnackbar = (
		message: string,
		type: "success" | "error" = "success",
	) => {
		setSnackbarMessage(message)
		setSnackbarType(type)
		setSnackbarVisible(true)
	}

	const onOpenStep = (route: Parameters<typeof router.push>[0]) => {
		hideSnackbar()
		clearSyncError()
		router.push(route)
	}

	const onPressSend = () => {
		Alert.alert(
			"Finalizar y enviar",
			"Al enviar este permiso, ya no podras modificarlo hasta que un admin lo habilite otra vez.",
			[
				{
					text: "Cancelar",
					style: "cancel",
				},
				{
					text: "Continuar",
					onPress: async () => {
						const result = await syncPermit(permitId)

						if (result.ok) {
							showSnackbar(
								"El permiso se envio correctamente",
								"success",
							)
							return
						}

						showSnackbar(
							result.error ?? "No se pudo enviar el permiso",
							"error",
						)
					},
				},
			],
		)
	}

	return (
		<SafeAreaView
			edges={["bottom"]}
			style={{ flex: 1, backgroundColor: theme.colors.background }}
		>
			<Stack.Screen
				options={{
					gestureEnabled: !syncingPermit,
					headerTintColor: syncingPermit
						? theme.colors.outline
						: theme.colors.onSurface,
					headerTitle: () => (
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "space-between",
								gap: 10,
								flex: 1,
							}}
						>
							<View
								style={{
									flexDirection: "row",
									alignItems: "center",
									gap: 8,
									flexShrink: 1,
								}}
							>
								<Icon
									source="file-key"
									size={18}
									color={theme.colors.onSurface}
								/>
								<Text
									style={{
										fontSize: 16,
										fontWeight: "700",
										color: theme.colors.onSurface,
										flexShrink: 1,
									}}
									numberOfLines={1}
								>
									{permitNumber ?? "Sin número"}
								</Text>
							</View>
							<Text
								style={{
									fontSize: 12,
									fontWeight: "500",
									color: theme.colors.onSurfaceVariant,
									flexShrink: 1,
									textAlign: "right",
								}}
								numberOfLines={1}
							>
								{communityName}
							</Text>
						</View>
					),
				}}
			/>
			<ScrollView
				contentContainerStyle={{
					padding: 20,
					paddingBottom: 140 + insets.bottom,
					backgroundColor: "transparent",
				}}
				style={{ flex: 1 }}
			>
				<StepList
					steps={[
						{
							title: "Participantes",
							state: participantsState,
							action: {
								icon: "pencil",
								onPress: () =>
									onOpenStep(
										ROUTES.PARTICIPANTS.OVERVIEW({
											permitId,
											permitNumber,
										}),
									),
							},
							details: <TotalChip total={participants.length} />,
						},
						{
							title: "Esquila",
							state: shearingState,
							action: {
								icon: "pencil",
								onPress: () =>
									onOpenStep(
										ROUTES.SHEARING.OVERVIEW({
											permitId,
											permitNumber,
										}),
									),
							},
							details: <TotalChip total={records.length} />,
						},
						{
							title: "Limpieza",
							state: cleaningState,
							action: {
								icon: "pencil",
								onPress: () =>
									onOpenStep(
										ROUTES.CLEANUP.OVERVIEW({
											permitId,
											permitNumber,
										}),
									),
							},
							details: (
								<TotalChip total={cleaningRecords.length} />
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
					paddingHorizontal: 16,
					paddingTop: 10,
					paddingBottom: 16 + insets.bottom,
					backgroundColor: theme.colors.background,
					borderTopWidth: 1,
					borderTopColor: theme.colors.surfaceVariant,
					gap: 10,
				}}
			>
				<Text
					style={{
						fontSize: 12,
						color: theme.colors.onSurfaceVariant,
						textAlign: "center",
					}}
				>
					{isPermitSynced
						? "Solicita al admin permiso para editar este envio."
						: canSendPermit
							? "Finaliza este permiso cuando ya no queden cambios por hacer."
							: "Completa los pasos de arriba para poder enviar este permiso."}
				</Text>
				<Button
					mode="contained"
					icon={isPermitSynced ? "lock" : "cloud-upload"}
					contentStyle={{ height: 48 }}
					buttonColor={theme.colors.custom.green}
					textColor={theme.colors.custom.white}
					disabled={!canSendPermit || isPermitSynced}
					onPress={onPressSend}
				>
					{isPermitSynced ? "Envío bloqueado" : "Finalizar y enviar"}
				</Button>
			</View>
			<Animated.View
				pointerEvents="box-none"
				style={{
					position: "absolute",
					left: 16,
					right: 16,
					bottom: 92 + insets.bottom,
					zIndex: 20,
					transform: [{ translateY: snackbarTranslateY }],
				}}
			>
				<Snackbar
					visible={snackbarVisible}
					onDismiss={hideSnackbar}
					duration={3500}
					style={{
						backgroundColor:
							snackbarType === "error"
								? theme.colors.error
								: theme.colors.inverseSurface,
					}}
					action={{
						label: "Cerrar",
						textColor:
							snackbarType === "error"
								? theme.colors.onError
								: theme.colors.inverseOnSurface,
						onPress: hideSnackbar,
					}}
				>
					<Text
						style={{
							color:
								snackbarType === "error"
									? theme.colors.onError
									: theme.colors.inverseOnSurface,
						}}
					>
						{snackbarMessage}
					</Text>
				</Snackbar>
			</Animated.View>
			<Portal>
				<Modal
					visible={syncingPermit}
					dismissable={false}
					contentContainerStyle={{
						marginHorizontal: 24,
						borderRadius: 20,
						paddingHorizontal: 24,
						paddingVertical: 20,
						backgroundColor: theme.colors.surface,
						alignItems: "center",
						gap: 12,
					}}
					theme={{
						colors: {
							backdrop: "rgba(0, 0, 0, 0.28)",
						},
					}}
				>
					<ActivityIndicator
						animating
						size="large"
						color={theme.colors.custom.green}
					/>
					<Text
						style={{
							fontSize: 14,
							fontWeight: "600",
							color: theme.colors.onSurface,
							textAlign: "center",
						}}
					>
						Enviando permiso...
					</Text>
				</Modal>
			</Portal>
		</SafeAreaView>
	)
}
