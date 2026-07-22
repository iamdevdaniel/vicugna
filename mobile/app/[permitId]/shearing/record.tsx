import {
	CustomDeleteButton,
	HeaderBreadcrumb,
	LabeledInput,
	ReadOnlyNotice,
	ToggleButtonGroup,
} from "@components"
import type { ShearingRecordFormData } from "@definitions/types"
import { yupResolver } from "@hookform/resolvers/yup"
import {
	useReadSinglePermit,
	useReadSingleShearingRecordFormData,
	useSingleShearingRecordActions,
} from "@hooks"
import {
	defaultValuesShearingRecord,
	yupShearingRecord,
} from "@utils/yup-shearing-record"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { Alert, KeyboardAvoidingView, ScrollView, View } from "react-native"
import { Button, TextInput } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

function formatNumber(value: number) {
	return value ? value.toString() : ""
}

function parseNumber(value: string) {
	return value === "" ? 0 : Number(value)
}

// SHEARING.RECORD /[permitId]/shearing/record
export default function () {
	const router = useRouter()
	const { permitId, recordId } = useLocalSearchParams<{
		permitId: string
		recordId?: string
	}>()
	const { data: permit } = useReadSinglePermit(permitId)
	const isPermitReadOnly = permit?.isSynced === true
	const permitLabel = permit?.permitNumber ?? "Sin número"
	const isEditForm = !!recordId
	const { data, loading: loadingData } =
		useReadSingleShearingRecordFormData(recordId)
	const {
		createSingleShearingRecord,
		updateSingleShearingRecord,
		deleteSingleShearingRecord,
		saving,
		deleting,
	} = useSingleShearingRecordActions()
	const isWaitingForEditData = isEditForm && (loadingData || !data)

	const {
		control,
		reset,
		formState: { errors, isValid },
		handleSubmit,
	} = useForm<ShearingRecordFormData>({
		mode: "onChange",
		defaultValues: defaultValuesShearingRecord,
		resolver: yupResolver(yupShearingRecord),
	})

	useEffect(() => {
		if (!data) return
		reset(data)
	}, [data, reset])

	const onSubmit = async (formData: ShearingRecordFormData) => {
		const ok = recordId
			? await updateSingleShearingRecord(recordId, formData)
			: await createSingleShearingRecord(permitId, formData)
		if (ok) {
			router.back()
		} else {
			Alert.alert("Error", "No se pudo guardar el registro")
		}
	}

	const onDelete = () => {
		if (!recordId) return
		Alert.alert(
			"Eliminar registro",
			"Seguro que quieres eliminar este registro?",
			[
				{ text: "Cancelar", style: "cancel" },
				{
					text: "Eliminar",
					style: "destructive",
					onPress: async () => {
						const ok = await deleteSingleShearingRecord(recordId)
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
								parts={[permitLabel, "Esquila", "Registros"]}
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
					<LabeledInput
						label="Numero de arete"
						labelPrefix="1"
						error={errors.tagNumber?.message}
						disabled={isPermitReadOnly}
					>
						<Controller
							control={control}
							name="tagNumber"
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
									error={!!errors.tagNumber}
									disabled={isPermitReadOnly}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Sexo"
						labelPrefix="2"
						error={errors.sex?.message}
						disabled={isPermitReadOnly}
					>
						<Controller
							control={control}
							name="sex"
							render={({ field: { onChange, value } }) => (
								<ToggleButtonGroup
									value={value}
									onChange={onChange}
									options={[
										{ label: "Macho", value: "M" },
										{ label: "Hembra", value: "F" },
									]}
									disabled={isPermitReadOnly}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Edad"
						labelPrefix="3"
						error={errors.ageCategory?.message}
						disabled={isPermitReadOnly}
					>
						<Controller
							control={control}
							name="ageCategory"
							render={({ field: { onChange, value } }) => (
								<ToggleButtonGroup
									value={value}
									onChange={onChange}
									options={[
										{ label: "Cria", value: "Cria" },
										{ label: "Juvenil", value: "Juvenil" },
										{ label: "Adulto", value: "Adulto" },
									]}
									disabled={isPermitReadOnly}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Peso vivo"
						labelPrefix="4"
						labelSuffix="kg"
						error={errors.liveWeight?.message}
						disabled={isPermitReadOnly}
					>
						<Controller
							control={control}
							name="liveWeight"
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
									keyboardType="decimal-pad"
									error={!!errors.liveWeight}
									disabled={isPermitReadOnly}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Longitud de fibra"
						labelPrefix="5"
						labelSuffix="cm"
						error={errors.fiberLength?.message}
						disabled={isPermitReadOnly}
					>
						<Controller
							control={control}
							name="fiberLength"
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
									keyboardType="decimal-pad"
									error={!!errors.fiberLength}
									disabled={isPermitReadOnly}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Condicion corporal"
						labelPrefix="6"
						error={errors.bodyCondition?.message}
						disabled={isPermitReadOnly}
					>
						<Controller
							control={control}
							name="bodyCondition"
							render={({ field: { onChange, value } }) => (
								<ToggleButtonGroup
									value={value}
									onChange={onChange}
									options={[
										{ label: "Malo", value: "Malo" },
										{ label: "Regular", value: "Regular" },
										{ label: "Bueno", value: "Bueno" },
									]}
									disabled={isPermitReadOnly}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Gestacion"
						labelPrefix="7"
						error={errors.gestationStatus?.message}
						disabled={isPermitReadOnly}
					>
						<Controller
							control={control}
							name="gestationStatus"
							render={({ field: { onChange, value } }) => (
								<ToggleButtonGroup
									value={value}
									onChange={onChange}
									options={[
										{ label: "No", value: "No" },
										{ label: "Si", value: "Si" },
										{
											label: "Si ultimo tercio",
											value: "Si ultimo tercio",
										},
									]}
									disabled={isPermitReadOnly}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Parasitos externos"
						labelPrefix="8"
						error={errors.externalParasites?.message}
						disabled={isPermitReadOnly}
					>
						<Controller
							control={control}
							name="externalParasites"
							render={({ field: { onChange, value } }) => (
								<ToggleButtonGroup
									value={value}
									onChange={onChange}
									options={[
										{
											label: "Ninguno",
											value: "Ninguno",
										},
										{
											label: "Garrapata",
											value: "Garrapata",
										},
										{ label: "Piojos", value: "Piojos" },
									]}
									disabled={isPermitReadOnly}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Sarna"
						labelPrefix="9"
						error={errors.mangeSeverity?.message}
						disabled={isPermitReadOnly}
					>
						<Controller
							control={control}
							name="mangeSeverity"
							render={({ field: { onChange, value } }) => (
								<ToggleButtonGroup
									value={value}
									onChange={onChange}
									options={[
										{
											label: "Ninguna",
											value: "Ninguna",
										},
										{ label: "Leve", value: "Leve" },
										{
											label: "Moderado",
											value: "Moderado",
										},
										{ label: "Severo", value: "Severo" },
									]}
									columns={2}
									disabled={isPermitReadOnly}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Caspa"
						labelPrefix="10"
						disabled={isPermitReadOnly}
					>
						<Controller
							control={control}
							name="hasDandruff"
							render={({ field: { onChange, value } }) => (
								<ToggleButtonGroup
									value={value ? "Si" : "No"}
									onChange={(val) => onChange(val === "Si")}
									options={[
										{ label: "No", value: "No" },
										{ label: "Si", value: "Si" },
									]}
									disabled={isPermitReadOnly}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Esquilado"
						labelPrefix="11"
						disabled={isPermitReadOnly}
					>
						<Controller
							control={control}
							name="isSheared"
							render={({ field: { onChange, value } }) => (
								<ToggleButtonGroup
									value={value ? "Si" : "No"}
									onChange={(val) => onChange(val === "Si")}
									options={[
										{ label: "No", value: "No" },
										{ label: "Si", value: "Si" },
									]}
									disabled={isPermitReadOnly}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Muerto"
						labelPrefix="12"
						disabled={isPermitReadOnly}
					>
						<Controller
							control={control}
							name="isDead"
							render={({ field: { onChange, value } }) => (
								<ToggleButtonGroup
									value={value ? "Si" : "No"}
									onChange={(val) => onChange(val === "Si")}
									options={[
										{ label: "No", value: "No" },
										{ label: "Si", value: "Si" },
									]}
									disabled={isPermitReadOnly}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Observaciones"
						labelPrefix="13"
						error={errors.observations?.message}
						disabled={isPermitReadOnly}
					>
						<Controller
							control={control}
							name="observations"
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<TextInput
									mode="outlined"
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									autoCapitalize="sentences"
									multiline
									style={{ height: 100 }}
									contentStyle={{
										height: 115,
										textAlignVertical: "top",
									}}
									error={!!errors.observations}
									disabled={isPermitReadOnly}
								/>
							)}
						/>
					</LabeledInput>

					<View
						style={{
							flexDirection: "column",
							gap: 12,
							marginTop: 16,
						}}
					>
						<Button
							mode="contained"
							onPress={handleSubmit(onSubmit)}
							disabled={
								isPermitReadOnly ||
								!isValid ||
								isWaitingForEditData ||
								saving ||
								deleting
							}
							style={{ flex: 1 }}
							loading={saving}
						>
							{isEditForm ? "Actualizar" : "Guardar"}
						</Button>
						{isEditForm && (
							<CustomDeleteButton
								onPress={onDelete}
								disabled={
									isPermitReadOnly || saving || deleting
								}
								style={{ flex: 1 }}
								loading={deleting}
							>
								Borrar
							</CustomDeleteButton>
						)}
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}
