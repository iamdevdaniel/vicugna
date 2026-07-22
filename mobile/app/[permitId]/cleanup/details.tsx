import {
	CleaningCommonSummary,
	CustomDeleteButton,
	DehearingFields,
	GroomingFields,
	HeaderBreadcrumb,
	LabeledInput,
	ReadOnlyNotice,
	ToggleButtonGroup,
} from "@components"
import type { DehearingFormData, GroomingFormData } from "@definitions/types"
import { yupResolver } from "@hookform/resolvers/yup"
import {
	useReadSingleCleaningCommon,
	useReadSingleDehearing,
	useReadSingleGrooming,
	useReadSinglePermit,
	useSingleCleaningCommonActions,
	useSingleDehearingActions,
	useSingleGroomingActions,
} from "@hooks"
import { ROUTES } from "@utils/constants"
import {
	defaultValuesDehearing,
	defaultValuesGrooming,
	yupDehearing,
	yupGrooming,
} from "@utils/yup-cleaning-record"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Alert, KeyboardAvoidingView, ScrollView, View } from "react-native"
import { Button, Divider } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

type CleaningDetailKind = "grooming" | "dehearing"

export default function () {
	const router = useRouter()
	const { permitId, recordId } = useLocalSearchParams<{
		permitId: string
		recordId: string
	}>()
	const [detailKind, setDetailKind] = useState<CleaningDetailKind>("grooming")
	const { data: permit } = useReadSinglePermit(permitId)
	const isPermitReadOnly = permit?.isSynced === true
	const permitLabel = permit?.permitNumber ?? "Sin número"

	const { data: commonData, loading: loadingCommon } =
		useReadSingleCleaningCommon(recordId)
	const { data: groomingData } = useReadSingleGrooming(recordId)
	const { data: dehearingData } = useReadSingleDehearing(recordId)
	const [isTypeUnlocked, setIsTypeUnlocked] = useState(false)

	const { deleteSingleCleaningCommon, deleting: deletingCommon } =
		useSingleCleaningCommonActions()
	const {
		createSingleGrooming,
		updateSingleGrooming,
		deleteSingleGrooming,
		saving: savingGrooming,
		deleting: deletingGrooming,
	} = useSingleGroomingActions()
	const {
		createSingleDehearing,
		updateSingleDehearing,
		deleteSingleDehearing,
		saving: savingDehearing,
		deleting: deletingDehearing,
	} = useSingleDehearingActions()

	const {
		control: groomingControl,
		reset: resetGrooming,
		formState: { errors: groomingErrors, isValid: isGroomingValid },
		handleSubmit: handleGroomingSubmit,
	} = useForm<GroomingFormData>({
		mode: "onChange",
		defaultValues: defaultValuesGrooming,
		resolver: yupResolver(yupGrooming),
	})

	const {
		control: dehearingControl,
		reset: resetDehearing,
		formState: { errors: dehearingErrors, isValid: isDehearingValid },
		handleSubmit: handleDehearingSubmit,
	} = useForm<DehearingFormData>({
		mode: "onChange",
		defaultValues: defaultValuesDehearing,
		resolver: yupResolver(yupDehearing),
	})

	useEffect(() => {
		if (!groomingData) return
		setDetailKind("grooming")
		resetGrooming({
			cleanWeight: groomingData.cleanWeight,
			dirtyWeight: groomingData.dirtyWeight,
			totalWeight: groomingData.totalWeight,
		})
	}, [groomingData, resetGrooming])

	useEffect(() => {
		if (!dehearingData) return
		setDetailKind("dehearing")
		resetDehearing({
			dehairedWeight: dehearingData.dehairedWeight,
			bristleWeight: dehearingData.bristleWeight,
			hasDandruff: dehearingData.hasDandruff,
			dehairerName: dehearingData.dehairerName,
			signature: dehearingData.signature,
		})
	}, [dehearingData, resetDehearing])

	const isWaitingForData = loadingCommon || !commonData
	const hasSavedDetail = !!groomingData || !!dehearingData
	const detailLocked = hasSavedDetail && !isTypeUnlocked
	const savingDetail = savingGrooming || savingDehearing
	const deletingDetail = deletingGrooming || deletingDehearing
	const isSavingGrooming = detailKind === "grooming"
	const saveDisabled =
		isPermitReadOnly ||
		deletingCommon ||
		deletingDetail ||
		savingDetail ||
		isWaitingForData ||
		(isSavingGrooming && !isGroomingValid) ||
		(!isSavingGrooming && !isDehearingValid)
	const saveLabel =
		detailKind === "grooming" ? "Guardar limpiado" : "Guardar predescerdado"

	const onSubmitGrooming = async (data: GroomingFormData) => {
		const ok = groomingData
			? await updateSingleGrooming(groomingData.id, data)
			: await createSingleGrooming(recordId, data)
		if (ok) {
			router.back()
		} else {
			Alert.alert("Error", "No se pudo guardar el limpiado")
		}
	}

	const onSubmitDehearing = async (data: DehearingFormData) => {
		const ok = dehearingData
			? await updateSingleDehearing(dehearingData.id, data)
			: await createSingleDehearing(recordId, data)
		if (ok) {
			router.back()
		} else {
			Alert.alert("Error", "No se pudo guardar el predescerdado")
		}
	}

	const onSave = () => {
		if (detailKind === "grooming") {
			handleGroomingSubmit(onSubmitGrooming)()
			return
		}
		handleDehearingSubmit(onSubmitDehearing)()
	}

	const onChangeType = (nextType: CleaningDetailKind) => {
		if (!groomingData && !dehearingData) return
		if (nextType === detailKind) return

		Alert.alert(
			"Cambiar tipo",
			"Cambiar el tipo borrará los datos guardados",
			[
				{ text: "Cancelar", style: "cancel" },
				{
					text: "Cambiar tipo",
					style: "destructive",
					onPress: async () => {
						const ok = groomingData
							? await deleteSingleGrooming(groomingData.id)
							: dehearingData
								? await deleteSingleDehearing(dehearingData.id)
								: false

						if (!ok) {
							Alert.alert("Error", "No se pudo cambiar el tipo")
							return
						}
						resetGrooming(defaultValuesGrooming)
						resetDehearing(defaultValuesDehearing)
						setDetailKind(nextType)
						setIsTypeUnlocked(true)
					},
				},
			],
		)
	}

	const onDelete = () => {
		Alert.alert(
			"Eliminar registro",
			"Seguro que quieres eliminar este registro?",
			[
				{ text: "Cancelar", style: "cancel" },
				{
					text: "Eliminar",
					style: "destructive",
					onPress: async () => {
						const ok = await deleteSingleCleaningCommon(recordId)
						if (ok) {
							router.back()
						} else {
							Alert.alert(
								"Error",
								"No se pudo eliminar el registro",
							)
						}
					},
				},
			],
		)
	}

	return (
		<SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior="height"
				keyboardVerticalOffset={100}
			>
				<Stack.Screen
					options={{
						headerTitle: () => (
							<HeaderBreadcrumb
								parts={[permitLabel, "Limpieza", "Registros"]}
							/>
						),
					}}
				/>
				<ScrollView
					style={{ flex: 1 }}
					contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
					keyboardShouldPersistTaps="handled"
				>
					{isPermitReadOnly && <ReadOnlyNotice />}
					<CleaningCommonSummary
						disabled={isPermitReadOnly}
						fleeceNumber={commonData?.fleeceNumber}
						grossWeight={commonData?.grossWeight}
						onEdit={
							isPermitReadOnly
								? undefined
								: () =>
										router.push(
											ROUTES.CLEANUP.RECORD(
												permitId,
												recordId,
											),
										)
						}
					/>

					{commonData && (
						<View style={{ gap: 16 }}>
							<Divider />
							<LabeledInput
								label="Tipo"
								labelPrefix="1"
								disabled={isPermitReadOnly}
							>
								<ToggleButtonGroup
									value={detailKind}
									onChange={(value) => {
										if (isPermitReadOnly) return
										const nextType =
											value as CleaningDetailKind
										if (detailLocked) {
											onChangeType(nextType)
											return
										}
										setDetailKind(nextType)
									}}
									options={[
										{
											label: "Limpiado",
											value: "grooming",
										},
										{
											label: "Predescerdado",
											value: "dehearing",
										},
									]}
									disabled={isPermitReadOnly}
								/>
							</LabeledInput>

							{detailKind === "grooming" ? (
								<View key="grooming">
									<GroomingFields
										control={groomingControl}
										errors={groomingErrors}
										disabled={isPermitReadOnly}
									/>
								</View>
							) : (
								<View key="dehearing">
									<DehearingFields
										control={dehearingControl}
										errors={dehearingErrors}
										disabled={isPermitReadOnly}
									/>
								</View>
							)}
						</View>
					)}
					<View style={{ gap: 12, marginTop: 16 }}>
						<Button
							mode="contained"
							onPress={onSave}
							disabled={saveDisabled}
							loading={savingDetail}
						>
							{saveLabel}
						</Button>
						<CustomDeleteButton
							onPress={onDelete}
							disabled={
								isPermitReadOnly ||
								savingDetail ||
								deletingDetail ||
								deletingCommon
							}
							loading={deletingCommon}
							style={{ flex: 1 }}
						>
							Borrar
						</CustomDeleteButton>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}
