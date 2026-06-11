import { LabeledInput, SignaturePad, ToggleButtonGroup } from "@components"
import type { DehearingFormData, GroomingFormData } from "@definitions/types"
import { yupResolver } from "@hookform/resolvers/yup"
import {
	useReadSingleCleaningCommon,
	useReadSingleDehearing,
	useReadSingleGrooming,
	useSingleCleaningCommonActions,
	useSingleDehearingActions,
	useSingleGroomingActions,
} from "@hooks"
import { ROUTES } from "@utils/constants"
import { useAppTheme } from "@utils/useAppTheme"
import {
	defaultValuesDehearing,
	defaultValuesGrooming,
	yupDehearing,
	yupGrooming,
} from "@utils/yup-cleaning-record"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import {
	Alert,
	KeyboardAvoidingView,
	ScrollView,
	Text,
	View,
} from "react-native"
import { Button, Divider, IconButton, TextInput } from "react-native-paper"
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
	const theme = useAppTheme()
	const router = useRouter()
	const { permitId, recordId } = useLocalSearchParams<{
		permitId: string
		recordId: string
	}>()
	const [detailKind, setDetailKind] = useState<CleaningDetailKind>("grooming")

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
				<Stack.Screen options={{ title: "Registro de limpieza" }} />
				<ScrollView
					style={{ flex: 1 }}
					contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
					keyboardShouldPersistTaps="handled"
				>
					<View
						style={{
							paddingVertical: 10,
							borderBottomWidth: 1,
							borderBottomColor: theme.colors.outlineVariant,
							gap: 6,
						}}
					>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "space-between",
							}}
						>
							<View style={{ flex: 1 }}>
								<Text
									style={{
										color: theme.colors.onSurfaceVariant,
										fontSize: 12,
									}}
								>
									Vellon
								</Text>
								<Text
									style={{
										color: theme.colors.onSurface,
										fontSize: 18,
										fontWeight: "700",
									}}
								>
									{commonData?.fleeceNumber}
								</Text>
							</View>

							<View style={{ flex: 1 }}>
								<Text
									style={{
										color: theme.colors.onSurfaceVariant,
										fontSize: 12,
									}}
								>
									Peso bruto
								</Text>
								<Text
									style={{
										color: theme.colors.onSurface,
										fontSize: 18,
										fontWeight: "700",
									}}
								>
									{commonData?.grossWeight} gramos
								</Text>
							</View>

							<IconButton
								icon="pencil"
								mode="outlined"
								size={18}
								onPress={() =>
									router.push(
										ROUTES.CLEANUP.RECORD(
											permitId,
											recordId,
										),
									)
								}
							/>
						</View>
					</View>

					{commonData && (
						<View style={{ marginTop: 20, gap: 16 }}>
							<Divider />
							<LabeledInput label="Tipo" labelPrefix="1">
								<ToggleButtonGroup
									value={detailKind}
									onChange={(value) => {
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
								/>
							</LabeledInput>

							{detailKind === "grooming" ? (
								<View key="grooming">
									<LabeledInput
										label="Peso vellon limpio"
										labelPrefix="2"
										labelSuffix="gramos"
										error={
											groomingErrors.cleanWeight?.message
										}
									>
										<Controller
											control={groomingControl}
											name="cleanWeight"
											render={({
												field: {
													onChange,
													onBlur,
													value,
												},
											}) => (
												<TextInput
													mode="outlined"
													value={formatNumber(value)}
													onChangeText={(text) =>
														onChange(
															parseNumber(text),
														)
													}
													onBlur={onBlur}
													keyboardType="numeric"
													error={
														!!groomingErrors.cleanWeight
													}
												/>
											)}
										/>
									</LabeledInput>

									<LabeledInput
										label="Peso braga"
										labelPrefix="3"
										labelSuffix="gramos"
										error={
											groomingErrors.dirtyWeight?.message
										}
									>
										<Controller
											control={groomingControl}
											name="dirtyWeight"
											render={({
												field: {
													onChange,
													onBlur,
													value,
												},
											}) => (
												<TextInput
													mode="outlined"
													value={formatNumber(value)}
													onChangeText={(text) =>
														onChange(
															parseNumber(text),
														)
													}
													onBlur={onBlur}
													keyboardType="numeric"
													error={
														!!groomingErrors.dirtyWeight
													}
												/>
											)}
										/>
									</LabeledInput>

									<LabeledInput
										label="Peso total fibra"
										labelPrefix="4"
										labelSuffix="gramos"
										error={
											groomingErrors.totalWeight?.message
										}
									>
										<Controller
											control={groomingControl}
											name="totalWeight"
											render={({
												field: {
													onChange,
													onBlur,
													value,
												},
											}) => (
												<TextInput
													mode="outlined"
													value={formatNumber(value)}
													onChangeText={(text) =>
														onChange(
															parseNumber(text),
														)
													}
													onBlur={onBlur}
													keyboardType="numeric"
													error={
														!!groomingErrors.totalWeight
													}
												/>
											)}
										/>
									</LabeledInput>
								</View>
							) : (
								<View key="dehearing">
									<LabeledInput
										label="Peso fibra predescerdada"
										labelPrefix="2"
										labelSuffix="gramos"
										error={
											dehearingErrors.dehairedWeight
												?.message
										}
									>
										<Controller
											control={dehearingControl}
											name="dehairedWeight"
											render={({
												field: {
													onChange,
													onBlur,
													value,
												},
											}) => (
												<TextInput
													mode="outlined"
													value={formatNumber(value)}
													onChangeText={(text) =>
														onChange(
															parseNumber(text),
														)
													}
													onBlur={onBlur}
													keyboardType="numeric"
													error={
														!!dehearingErrors.dehairedWeight
													}
												/>
											)}
										/>
									</LabeledInput>

									<LabeledInput
										label="Peso cerda"
										labelPrefix="3"
										labelSuffix="gramos"
										error={
											dehearingErrors.bristleWeight
												?.message
										}
									>
										<Controller
											control={dehearingControl}
											name="bristleWeight"
											render={({
												field: {
													onChange,
													onBlur,
													value,
												},
											}) => (
												<TextInput
													mode="outlined"
													value={formatNumber(value)}
													onChangeText={(text) =>
														onChange(
															parseNumber(text),
														)
													}
													onBlur={onBlur}
													keyboardType="numeric"
													error={
														!!dehearingErrors.bristleWeight
													}
												/>
											)}
										/>
									</LabeledInput>

									<LabeledInput label="Caspa" labelPrefix="4">
										<Controller
											control={dehearingControl}
											name="hasDandruff"
											render={({
												field: { onChange, value },
											}) => (
												<ToggleButtonGroup
													value={value ? "Si" : "No"}
													onChange={(nextValue) =>
														onChange(
															nextValue === "Si",
														)
													}
													options={[
														{
															label: "No",
															value: "No",
														},
														{
															label: "Si",
															value: "Si",
														},
													]}
												/>
											)}
										/>
									</LabeledInput>

									<LabeledInput
										label="Nombre del predescerdador (a)"
										labelPrefix="5"
										error={
											dehearingErrors.dehairerName
												?.message
										}
									>
										<Controller
											control={dehearingControl}
											name="dehairerName"
											render={({
												field: {
													onChange,
													onBlur,
													value,
												},
											}) => (
												<TextInput
													mode="outlined"
													value={value}
													onChangeText={onChange}
													onBlur={onBlur}
													error={
														!!dehearingErrors.dehairerName
													}
												/>
											)}
										/>
									</LabeledInput>

									<LabeledInput
										label="Firma"
										labelPrefix="6"
										error={
											dehearingErrors.signature?.message
										}
									>
										<Controller
											control={dehearingControl}
											name="signature"
											render={({
												field: { onChange, value },
											}) => (
												<SignaturePad
													value={value}
													onChange={onChange}
												/>
											)}
										/>
									</LabeledInput>
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
						<Button
							mode="contained"
							onPress={onDelete}
							disabled={
								savingDetail || deletingDetail || deletingCommon
							}
							loading={deletingCommon}
							textColor={theme.colors.onError}
							style={{
								flex: 1,
								backgroundColor: theme.colors.custom.crimson,
							}}
						>
							Borrar
						</Button>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}
