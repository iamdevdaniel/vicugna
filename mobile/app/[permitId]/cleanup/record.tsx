import {
	CustomDeleteButton,
	DehearingFields,
	GroomingFields,
	HeaderBreadcrumb,
	LabeledInput,
	ReadOnlyNotice,
	ToggleButtonGroup,
} from "@components"
import type {
	CleaningCommonFormData,
	DehearingFormData,
	GroomingFormData,
} from "@definitions/types"
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
import {
	defaultValuesCleaningCommon,
	defaultValuesDehearing,
	defaultValuesGrooming,
	yupCleaningCommon,
	yupDehearing,
	yupGrooming,
} from "@utils/yup-cleaning-record"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Alert, KeyboardAvoidingView, ScrollView, View } from "react-native"
import { Button, TextInput } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

type CleaningDetailKind = "grooming" | "dehearing"

function formatNumber(value: number) {
	return Number.isFinite(value) ? value.toString() : ""
}

function parseNumber(value: string) {
	const digits = value.replace(/\D/g, "")
	return digits === "" ? Number.NaN : Number(digits)
}

export default function () {
	const router = useRouter()
	const { permitId, recordId } = useLocalSearchParams<{
		permitId: string
		recordId?: string
	}>()
	const isEditForm = !!recordId
	const [detailKind, setDetailKind] = useState<CleaningDetailKind>("grooming")
	const { data: permit } = useReadSinglePermit(permitId)
	const isPermitReadOnly = permit?.syncStatus === "synced"
	const permitLabel = permit?.permitNumber ?? "Sin número"

	const { data: commonData, loading: loadingCommon } =
		useReadSingleCleaningCommon(recordId)
	const { data: groomingData } = useReadSingleGrooming(recordId)
	const { data: dehearingData } = useReadSingleDehearing(recordId)

	const {
		createSingleCleaningCommon,
		updateSingleCleaningCommon,
		deleteSingleCleaningCommon,
		saving: savingCommon,
		deleting: deletingCommon,
	} = useSingleCleaningCommonActions()
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
		control: commonControl,
		getValues: getCommonValues,
		reset: resetCommon,
		formState: { errors: commonErrors, isValid: isCommonValid },
		trigger: triggerCommon,
	} = useForm<CleaningCommonFormData>({
		mode: "onChange",
		defaultValues: defaultValuesCleaningCommon,
		resolver: yupResolver(yupCleaningCommon),
	})

	const {
		control: groomingControl,
		getValues: getGroomingValues,
		reset: resetGrooming,
		formState: { errors: groomingErrors, isValid: isGroomingValid },
		trigger: triggerGrooming,
	} = useForm<GroomingFormData>({
		mode: "onChange",
		defaultValues: defaultValuesGrooming,
		resolver: yupResolver(yupGrooming),
	})

	const {
		control: dehearingControl,
		getValues: getDehearingValues,
		reset: resetDehearing,
		formState: { errors: dehearingErrors, isValid: isDehearingValid },
		trigger: triggerDehearing,
	} = useForm<DehearingFormData>({
		mode: "onChange",
		defaultValues: defaultValuesDehearing,
		resolver: yupResolver(yupDehearing),
	})

	useEffect(() => {
		if (loadingCommon || !commonData) {
			return
		}

		resetCommon({
			fleeceNumber: commonData.fleeceNumber,
			grossWeight: commonData.grossWeight,
		})
	}, [commonData, loadingCommon, resetCommon])

	useEffect(() => {
		if (!groomingData) {
			return
		}

		setDetailKind("grooming")
		resetGrooming({
			cleanWeight: groomingData.cleanWeight,
			dirtyWeight: groomingData.dirtyWeight,
			totalWeight: groomingData.totalWeight,
		})
	}, [groomingData, resetGrooming])

	useEffect(() => {
		if (!dehearingData) {
			return
		}

		setDetailKind("dehearing")
		resetDehearing({
			dehairedWeight: dehearingData.dehairedWeight,
			bristleWeight: dehearingData.bristleWeight,
			hasDandruff: dehearingData.hasDandruff,
			dehairerName: dehearingData.dehairerName,
			signature: dehearingData.signature,
		})
	}, [dehearingData, resetDehearing])

	const isWaitingForData = isEditForm && (loadingCommon || !commonData)
	const saving = savingCommon || savingGrooming || savingDehearing
	const deleting = deletingCommon || deletingGrooming || deletingDehearing
	const saveDisabled =
		isPermitReadOnly ||
		saving ||
		deleting ||
		isWaitingForData ||
		!isCommonValid ||
		(detailKind === "grooming" ? !isGroomingValid : !isDehearingValid)
	const saveLabel =
		detailKind === "grooming" ? "Guardar limpiado" : "Guardar predescerdado"

	const saveGrooming = async (
		cleaningCommonId: string,
		data: GroomingFormData,
	) => {
		if (dehearingData) {
			const deleted = await deleteSingleDehearing(dehearingData.id)

			if (!deleted) {
				Alert.alert("Error", "No se pudo cambiar el tipo")
				return false
			}
		}

		return groomingData
			? await updateSingleGrooming(groomingData.id, data)
			: await createSingleGrooming(cleaningCommonId, data)
	}

	const saveDehearing = async (
		cleaningCommonId: string,
		data: DehearingFormData,
	) => {
		if (groomingData) {
			const deleted = await deleteSingleGrooming(groomingData.id)

			if (!deleted) {
				Alert.alert("Error", "No se pudo cambiar el tipo")
				return false
			}
		}

		return dehearingData
			? await updateSingleDehearing(dehearingData.id, data)
			: await createSingleDehearing(cleaningCommonId, data)
	}

	const onSave = async () => {
		const isCommonFormValid = await triggerCommon()

		if (!isCommonFormValid) {
			return
		}

		const commonFormData = getCommonValues()
		const commonRecord = recordId
			? await updateSingleCleaningCommon(recordId, commonFormData)
			: await createSingleCleaningCommon(permitId, commonFormData)

		if (!commonRecord) {
			Alert.alert("Error", "No se pudo guardar el registro")
			return
		}

		if (detailKind === "grooming") {
			const isGroomingFormValid = await triggerGrooming()

			if (!isGroomingFormValid) {
				return
			}

			const ok = await saveGrooming(commonRecord.id, getGroomingValues())

			if (ok) {
				router.back()
				return
			}

			Alert.alert("Error", "No se pudo guardar el limpiado")
			return
		}

		const isDehearingFormValid = await triggerDehearing()

		if (!isDehearingFormValid) {
			return
		}

		const ok = await saveDehearing(commonRecord.id, getDehearingValues())

		if (ok) {
			router.back()
			return
		}

		Alert.alert("Error", "No se pudo guardar el predescerdado")
	}

	const onDelete = () => {
		if (!recordId) {
			router.back()
			return
		}

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
							return
						}

						Alert.alert("Error", "No se pudo eliminar el registro")
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
								parts={[permitLabel, "Limpieza", "Registro"]}
							/>
						),
					}}
				/>
				<ScrollView
					style={{ flex: 1 }}
					contentContainerStyle={{
						flexGrow: 1,
						padding: 20,
						paddingBottom: 20,
					}}
					keyboardShouldPersistTaps="handled"
				>
					{isPermitReadOnly && <ReadOnlyNotice />}
					<LabeledInput
						label="Tipo"
						labelPrefix="1"
						disabled={isPermitReadOnly}
					>
						<ToggleButtonGroup
							value={detailKind}
							onChange={(value) => {
								if (isPermitReadOnly) {
									return
								}

								setDetailKind(value as CleaningDetailKind)
							}}
							options={[
								{ label: "Limpiado", value: "grooming" },
								{
									label: "Predescerdado",
									value: "dehearing",
								},
							]}
							disabled={isPermitReadOnly}
						/>
					</LabeledInput>

					<LabeledInput
						label="Nro de vellon"
						labelPrefix="2"
						error={commonErrors.fleeceNumber?.message}
						disabled={isPermitReadOnly}
					>
						<Controller
							control={commonControl}
							name="fleeceNumber"
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<TextInput
									mode="outlined"
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									autoCapitalize="words"
									error={!!commonErrors.fleeceNumber}
									disabled={isPermitReadOnly}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Peso bruto"
						labelPrefix="3"
						labelSuffix="gramos"
						error={commonErrors.grossWeight?.message}
						disabled={isPermitReadOnly}
					>
						<Controller
							control={commonControl}
							name="grossWeight"
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<TextInput
									mode="outlined"
									value={formatNumber(value)}
									onChangeText={(text) =>
										onChange(parseNumber(text))
									}
									onBlur={onBlur}
									keyboardType="numeric"
									error={!!commonErrors.grossWeight}
									disabled={isPermitReadOnly}
								/>
							)}
						/>
					</LabeledInput>

					{detailKind === "grooming" ? (
						<GroomingFields
							control={groomingControl}
							errors={groomingErrors}
							disabled={isPermitReadOnly}
							startIndex={4}
						/>
					) : (
						<DehearingFields
							control={dehearingControl}
							errors={dehearingErrors}
							disabled={isPermitReadOnly}
							startIndex={4}
						/>
					)}

					<View style={{ gap: 12, marginTop: 16 }}>
						<Button
							mode="contained"
							onPress={onSave}
							disabled={saveDisabled}
							loading={saving}
						>
							{saveLabel}
						</Button>
						<CustomDeleteButton
							onPress={onDelete}
							disabled={isPermitReadOnly || saving || deleting}
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
