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
	CleaningRecordSaveData,
	DehearingFormData,
	GroomingFormData,
} from "@definitions/types"
import { yupResolver } from "@hookform/resolvers/yup"
import {
	useReadSingleCleaningCommon,
	useReadSingleDehearing,
	useReadSingleGrooming,
	useReadSinglePermit,
	useSingleCleaningRecordActions,
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
import { useEffect, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Alert, KeyboardAvoidingView, ScrollView, View } from "react-native"
import { Button, Divider, Text, TextInput } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

type CleaningType = "grooming" | "dehearing"

export default function CleaningRecordScreen() {
	const router = useRouter()
	const { permitId, recordId } = useLocalSearchParams<{
		permitId: string
		recordId?: string
	}>()
	const isEditForm = !!recordId
	const operationInFlightRef = useRef(false)
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
		createSingleCleaningRecord,
		updateSingleCleaningRecord,
		deleteSingleCleaningRecord,
		saving,
		deleting,
	} = useSingleCleaningRecordActions()

	const {
		control: commonControl,
		getValues: getCommonValues,
		reset: resetCommon,
		watch: watchCommon,
		formState: { errors: commonErrors, isValid: isCommonValid },
		trigger: triggerCommon,
	} = useForm<CleaningCommonFormData>({
		mode: "onChange",
		defaultValues: defaultValuesCleaningCommon,
		resolver: yupResolver(yupCleaningCommon),
	})
	const grossWeight = watchCommon("grossWeight")

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
		context: { grossWeight },
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
		if (!isEditForm || !grossWeight) {
			return
		}

		const fieldsToValidate: ("cleanWeight" | "dirtyWeight")[] = []
		if (cleanWeight) fieldsToValidate.push("cleanWeight")
		if (dirtyWeight) fieldsToValidate.push("dirtyWeight")

		if (fieldsToValidate.length > 0) {
			triggerGrooming(fieldsToValidate)
		}
	}, [cleanWeight, dirtyWeight, grossWeight, isEditForm, triggerGrooming])

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
	const detailFieldsDisabled = !isEditForm
	const saveDisabled =
		isPermitReadOnly ||
		saving ||
		deleting ||
		isLoadingScreenData ||
		!isCommonValid ||
		(isEditForm &&
			(cleaningType === "grooming"
				? !isGroomingValid
				: !isDehearingValid))

	const onSave = async () => {
		if (operationInFlightRef.current) {
			return
		}
		operationInFlightRef.current = true

		try {
			const isCommonFormValid = await triggerCommon()
			if (!isCommonFormValid) {
				return
			}

			if (!recordId) {
				const ok = await createSingleCleaningRecord(
					permitId,
					getCommonValues(),
				)

				if (ok) {
					router.back()
					return
				}

				Alert.alert("Error", "No se pudo guardar el registro de fibra")
				return
			}

			const isDetailFormValid =
				cleaningType === "grooming"
					? await triggerGrooming()
					: await triggerDehearing()

			if (!isDetailFormValid) {
				return
			}

			const saveData: CleaningRecordSaveData =
				cleaningType === "grooming"
					? {
							cleaningType,
							common: getCommonValues(),
							detail: getGroomingValues(),
						}
					: {
							cleaningType,
							common: getCommonValues(),
							detail: getDehearingValues(),
						}
			const ok = await updateSingleCleaningRecord(recordId, saveData)

			if (ok) {
				router.back()
				return
			}

			Alert.alert("Error", "No se pudo guardar el registro de fibra")
		} finally {
			operationInFlightRef.current = false
		}
	}

	const onDelete = () => {
		if (operationInFlightRef.current) {
			return
		}

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
						if (operationInFlightRef.current) {
							return
						}
						operationInFlightRef.current = true

						try {
							const ok =
								await deleteSingleCleaningRecord(recordId)

							if (ok) {
								router.back()
								return
							}

							Alert.alert(
								"Error",
								"No se pudo eliminar el registro de fibra",
							)
						} finally {
							operationInFlightRef.current = false
						}
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
						label="Nro. de vellón"
						labelPrefix="1"
						value={commonData.fleeceNumber}
					/>
					<ReadOnlyField
						label="Peso bruto"
						labelPrefix="2"
						labelSuffix="gramos"
						value={commonData.grossWeight.toString()}
					/>
					<ReadOnlyField
						label="Tipo"
						labelPrefix="3"
						value={
							groomingData
								? "Limpiado"
								: dehearingData
									? "Predescerdado"
									: ""
						}
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
						label="Nro de vellon"
						labelPrefix="1"
						error={commonErrors.fleeceNumber?.message}
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
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Peso bruto"
						labelPrefix="2"
						labelSuffix="gramos"
						error={commonErrors.grossWeight?.message}
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
								/>
							)}
						/>
					</LabeledInput>

					<View
						style={{
							marginBottom: detailFieldsDisabled ? 12 : 16,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
						}}
					>
						{detailFieldsDisabled && (
							<Text
								variant="labelMedium"
								style={{
									marginTop: 12,
									opacity: 0.6,
									paddingBottom: 8,
								}}
							>
								Guarda primero estos datos para continuar
							</Text>
						)}
						<Divider style={{ width: "100%" }} />
					</View>

					<LabeledInput
						label="Tipo"
						labelPrefix="3"
						disabled={detailFieldsDisabled}
					>
						<ToggleButtonGroup
							value={cleaningType}
							onChange={(value) =>
								setCleaningType(value as CleaningType)
							}
							options={[
								{ label: "Limpiado", value: "grooming" },
								{
									label: "Predescerdado",
									value: "dehearing",
								},
							]}
							disabled={detailFieldsDisabled}
						/>
					</LabeledInput>

					{cleaningType === "grooming" ? (
						<GroomingFields
							control={groomingControl}
							errors={groomingErrors}
							startIndex={4}
							disabled={detailFieldsDisabled}
						/>
					) : (
						<DehearingFields
							control={dehearingControl}
							errors={dehearingErrors}
							startIndex={4}
							disabled={detailFieldsDisabled}
						/>
					)}

					<View style={{ gap: 12, marginTop: 16 }}>
						<Button
							mode="contained"
							onPress={onSave}
							disabled={saveDisabled}
							loading={saving}
						>
							Guardar
						</Button>
						<CustomDeleteButton
							onPress={onDelete}
							disabled={isPermitReadOnly || saving || deleting}
							loading={deleting}
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
