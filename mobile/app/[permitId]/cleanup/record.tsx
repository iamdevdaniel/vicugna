import {
	CustomDeleteButton,
	DehearingFields,
	GroomingFields,
	LabeledInput,
	LoadingOverlay,
	ReadOnlyField,
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
import { calculateTotalWeight } from "@utils/grooming-record-rules"
import {
	defaultValuesCleaningCommon,
	defaultValuesDehearing,
	defaultValuesGrooming,
	yupCleaningCommon,
	yupDehearing,
	yupGrooming,
} from "@utils/yup-cleaning-record"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Alert, KeyboardAvoidingView, ScrollView, View } from "react-native"
import { Button, TextInput } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

type CleaningType = "grooming" | "dehearing"

export default function CleaningRecordScreen() {
	const router = useRouter()
	const { permitId, recordId } = useLocalSearchParams<{
		permitId: string
		recordId?: string
	}>()
	const isEditForm = !!recordId
	const [cleaningType, setCleaningType] = useState<CleaningType>("grooming")
	const { data: permit, loading: loadingPermit } =
		useReadSinglePermit(permitId)
	const isPermitReadOnly = permit?.syncStatus === "synced"

	const { data: commonData, loading: loadingCommon } =
		useReadSingleCleaningCommon(recordId)
	const { data: groomingData, loading: loadingGrooming } =
		useReadSingleGrooming(recordId)
	const { data: dehearingData, loading: loadingDehearing } =
		useReadSingleDehearing(recordId)

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
		setValue: setGroomingValue,
		watch: watchGrooming,
		formState: { errors: groomingErrors, isValid: isGroomingValid },
		trigger: triggerGrooming,
	} = useForm<GroomingFormData>({
		mode: "onChange",
		defaultValues: defaultValuesGrooming,
		resolver: yupResolver(yupGrooming),
	})
	const cleanWeight = watchGrooming("cleanWeight")
	const dirtyWeight = watchGrooming("dirtyWeight")
	const totalWeight = calculateTotalWeight(cleanWeight, dirtyWeight)

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
			grossWeight: commonData.grossWeight.toString(),
		})
	}, [commonData, loadingCommon, resetCommon])

	useEffect(() => {
		if (!groomingData) {
			return
		}

		setCleaningType("grooming")
		resetGrooming({
			cleanWeight: groomingData.cleanWeight.toString(),
			dirtyWeight: groomingData.dirtyWeight.toString(),
			totalWeight: groomingData.totalWeight.toString(),
		})
	}, [groomingData, resetGrooming])

	useEffect(() => {
		setGroomingValue("totalWeight", totalWeight, {
			shouldValidate: totalWeight !== "",
		})
	}, [setGroomingValue, totalWeight])

	useEffect(() => {
		if (!dehearingData) {
			return
		}

		setCleaningType("dehearing")
		resetDehearing({
			dehairedWeight: dehearingData.dehairedWeight.toString(),
			bristleWeight: dehearingData.bristleWeight.toString(),
			hasDandruff: dehearingData.hasDandruff,
			dehairerName: dehearingData.dehairerName,
			signature: dehearingData.signature,
		})
	}, [dehearingData, resetDehearing])

	const isLoadingScreenData =
		loadingPermit ||
		(isEditForm &&
			(loadingCommon ||
				loadingGrooming ||
				loadingDehearing ||
				!commonData))
	const saving = savingCommon || savingGrooming || savingDehearing
	const deleting = deletingCommon || deletingGrooming || deletingDehearing
	const saveDisabled =
		isPermitReadOnly ||
		saving ||
		deleting ||
		isLoadingScreenData ||
		!isCommonValid ||
		(cleaningType === "grooming" ? !isGroomingValid : !isDehearingValid)
	const saveLabel =
		cleaningType === "grooming"
			? "Guardar limpiado"
			: "Guardar predescerdado"

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
			Alert.alert("Error", "No se pudo guardar el registro de fibra")
			return
		}

		if (cleaningType === "grooming") {
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
			"Eliminar registro de fibra",
			"Seguro que quieres eliminar este registro de fibra?",
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

						Alert.alert(
							"Error",
							"No se pudo eliminar el registro de fibra",
						)
					},
				},
			],
		)
	}

	if (isLoadingScreenData) {
		return (
			<SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
				<LoadingOverlay message="Cargando..." />
			</SafeAreaView>
		)
	}

	if (isPermitReadOnly && commonData) {
		return (
			<SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
				<ScrollView
					style={{ flex: 1 }}
					contentContainerStyle={{
						padding: 20,
						paddingBottom: 20,
					}}
				>
					<ReadOnlyNotice />
					<ReadOnlyField
						label="Tipo"
						labelPrefix="1"
						value={
							groomingData
								? "Limpiado"
								: dehearingData
									? "Predescerdado"
									: ""
						}
					/>
					<ReadOnlyField
						label="Nro. de vellón"
						labelPrefix="2"
						value={commonData.fleeceNumber}
					/>
					<ReadOnlyField
						label="Peso bruto"
						labelPrefix="3"
						labelSuffix="gramos"
						value={commonData.grossWeight.toString()}
					/>
					{groomingData ? (
						<>
							<ReadOnlyField
								label="Peso vellón limpio"
								labelPrefix="4"
								labelSuffix="gramos"
								value={groomingData.cleanWeight.toString()}
							/>
							<ReadOnlyField
								label="Peso braga"
								labelPrefix="5"
								labelSuffix="gramos"
								value={groomingData.dirtyWeight.toString()}
							/>
							<ReadOnlyField
								label="Peso total fibra"
								labelPrefix="6"
								labelSuffix="gramos"
								value={groomingData.totalWeight.toString()}
							/>
						</>
					) : dehearingData ? (
						<>
							<ReadOnlyField
								label="Peso fibra predescerdada"
								labelPrefix="4"
								labelSuffix="gramos"
								value={dehearingData.dehairedWeight.toString()}
							/>
							<ReadOnlyField
								label="Peso cerda"
								labelPrefix="5"
								labelSuffix="gramos"
								value={dehearingData.bristleWeight.toString()}
							/>
							<ReadOnlyField
								label="Caspa"
								labelPrefix="6"
								value={dehearingData.hasDandruff ? "Sí" : "No"}
							/>
							<ReadOnlyField
								label="Nombre del predescerdador (a)"
								labelPrefix="7"
								value={dehearingData.dehairerName}
							/>
							<ReadOnlyField
								label="Firma"
								labelPrefix="8"
								value={dehearingData.signature}
								valueType="signature"
							/>
						</>
					) : null}
				</ScrollView>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior="height"
				keyboardVerticalOffset={100}
			>
				<ScrollView
					style={{ flex: 1 }}
					contentContainerStyle={{
						flexGrow: 1,
						padding: 20,
						paddingBottom: 20,
					}}
					keyboardShouldPersistTaps="handled"
				>
					<LabeledInput
						label="Tipo"
						labelPrefix="1"
						disabled={isPermitReadOnly}
					>
						<ToggleButtonGroup
							value={cleaningType}
							onChange={(value) => {
								if (isPermitReadOnly) {
									return
								}

								setCleaningType(value as CleaningType)
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
									keyboardType="numeric"
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
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									keyboardType="numeric"
									error={!!commonErrors.grossWeight}
									disabled={isPermitReadOnly}
								/>
							)}
						/>
					</LabeledInput>

					{cleaningType === "grooming" ? (
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
