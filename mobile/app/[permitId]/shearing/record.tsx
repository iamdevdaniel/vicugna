import {
	CustomDeleteButton,
	LabeledInput,
	LoadingOverlay,
	MultiSelectButtonGroup,
	ReadOnlyField,
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
	canHaveGestation,
	deriveIsSheared,
	normalizeGestationStatus,
} from "@utils/shearing-record-rules"
import {
	defaultValuesShearingRecord,
	yupShearingRecord,
} from "@utils/yup-shearing-record"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { Alert, KeyboardAvoidingView, ScrollView, View } from "react-native"
import { Button, Icon, TextInput } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

// SHEARING.RECORD /[permitId]/shearing/record
export default function ShearingRecordScreen() {
	const router = useRouter()
	const { permitId, recordId } = useLocalSearchParams<{
		permitId: string
		recordId?: string
	}>()
	const { data: permit, loading: loadingPermit } =
		useReadSinglePermit(permitId)
	const isPermitReadOnly = permit?.syncStatus === "synced"
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
	const isLoadingScreenData =
		loadingPermit || (isEditForm && (loadingData || !data))

	const {
		control,
		reset,
		setValue,
		watch,
		formState: { errors, isValid },
		handleSubmit,
	} = useForm<ShearingRecordFormData>({
		mode: "onChange",
		defaultValues: defaultValuesShearingRecord,
		resolver: yupResolver(yupShearingRecord),
	})
	const sex = watch("sex")
	const ageCategory = watch("ageCategory")
	const gestationStatus = watch("gestationStatus")
	const gestationAllowed = canHaveGestation(sex, ageCategory)
	const normalizedGestationStatus = normalizeGestationStatus(
		sex,
		ageCategory,
		gestationStatus,
	)
	const shouldBeSheared = deriveIsSheared(
		ageCategory,
		normalizedGestationStatus,
	)

	useEffect(() => {
		if (!data) return
		reset(data)
	}, [data, reset])

	useEffect(() => {
		if (gestationStatus !== normalizedGestationStatus) {
			setValue("gestationStatus", normalizedGestationStatus, {
				shouldValidate: true,
			})
		}
		setValue("isSheared", shouldBeSheared, { shouldValidate: true })
	}, [gestationStatus, normalizedGestationStatus, setValue, shouldBeSheared])

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
			{isLoadingScreenData ? (
				<LoadingOverlay message="Cargando registro..." />
			) : isPermitReadOnly && data ? (
				<ScrollView
					style={{ flex: 1 }}
					contentContainerStyle={{
						padding: 20,
						paddingBottom: 20,
					}}
				>
					<ReadOnlyNotice />
					<ReadOnlyField
						label="Número de arete"
						labelPrefix="1"
						value={data.tagNumber}
					/>
					<ReadOnlyField
						label="Sexo"
						labelPrefix="2"
						value={data.sex === "F" ? "Hembra" : "Macho"}
					/>
					<ReadOnlyField
						label="Edad"
						labelPrefix="3"
						value={
							data.ageCategory === "Cria"
								? "Cría"
								: data.ageCategory
						}
					/>
					<ReadOnlyField
						label="Peso vivo"
						labelPrefix="4"
						labelSuffix="kg"
						value={data.liveWeight}
					/>
					<ReadOnlyField
						label="Longitud de fibra"
						labelPrefix="5"
						labelSuffix="cm"
						value={data.fiberLength}
					/>
					<ReadOnlyField
						label="Condición corporal"
						labelPrefix="6"
						value={data.bodyCondition}
					/>
					<ReadOnlyField
						label="Gestación"
						labelPrefix="7"
						value={
							data.gestationStatus === "Si ultimo tercio"
								? "Sí, último tercio"
								: data.gestationStatus === "Si"
									? "Sí"
									: data.gestationStatus
						}
					/>
					<ReadOnlyField
						label="Parásitos externos"
						labelPrefix="8"
						value={
							data.externalParasites.length > 0
								? data.externalParasites.join(", ")
								: "Ninguno"
						}
					/>
					<ReadOnlyField
						label="Sarna"
						labelPrefix="9"
						value={data.mangeSeverity}
					/>
					<ReadOnlyField
						label="Caspa"
						labelPrefix="10"
						value={data.hasDandruff ? "Sí" : "No"}
					/>
					<ReadOnlyField
						label="Muerto"
						labelPrefix="11"
						value={data.isDead ? "Sí" : "No"}
					/>
					<ReadOnlyField
						label="Esquilado"
						labelPrefix="12"
						value={data.isSheared ? "Sí" : "No"}
					/>
					<ReadOnlyField
						label="Observaciones"
						labelPrefix="13"
						value={data.observations}
					/>
				</ScrollView>
			) : (
				<KeyboardAvoidingView
					style={{ flex: 1 }}
					behavior="height"
					keyboardVerticalOffset={100}
				>
					<ScrollView
						style={{ flex: 1 }}
						contentContainerStyle={{
							padding: 20,
							paddingBottom: 20,
						}}
						keyboardShouldPersistTaps="handled"
					>
						<LabeledInput
							label="Número de arete"
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
										value={value}
										onChangeText={onChange}
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
											{
												label: "Juvenil",
												value: "Juvenil",
											},
											{
												label: "Adulto",
												value: "Adulto",
											},
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
										value={value}
										onChangeText={onChange}
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
										value={value}
										onChangeText={onChange}
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
											{
												label: "Regular",
												value: "Regular",
											},
											{ label: "Bueno", value: "Bueno" },
										]}
										disabled={isPermitReadOnly}
									/>
								)}
							/>
						</LabeledInput>

						<LabeledInput
							label={
								<>
									Gestacion
									{!gestationAllowed && (
										<>
											{" "}
											<Icon
												source="lock-outline"
												size={18}
											/>
										</>
									)}
								</>
							}
							labelPrefix="7"
							error={errors.gestationStatus?.message}
							disabled={isPermitReadOnly}
						>
							<View
								pointerEvents={
									gestationAllowed ? "auto" : "none"
								}
							>
								<Controller
									control={control}
									name="gestationStatus"
									render={({
										field: { onChange, value },
									}) => (
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
							</View>
						</LabeledInput>

						<LabeledInput
							label="Parásitos externos"
							labelPrefix="8"
							error={errors.externalParasites?.message}
							disabled={isPermitReadOnly}
						>
							<Controller
								control={control}
								name="externalParasites"
								render={({ field: { onChange, value } }) => (
									<MultiSelectButtonGroup
										value={value}
										onChange={onChange}
										options={[
											{
												label: "Garrapata",
												value: "Garrapata",
											},
											{
												label: "Piojos",
												value: "Piojos",
											},
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
											{
												label: "Severo",
												value: "Severo",
											},
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
										onChange={(val) =>
											onChange(val === "Si")
										}
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
							labelPrefix="11"
							disabled={isPermitReadOnly}
						>
							<Controller
								control={control}
								name="isDead"
								render={({ field: { onChange, value } }) => (
									<ToggleButtonGroup
										value={value ? "Si" : "No"}
										onChange={(val) =>
											onChange(val === "Si")
										}
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
							label={
								<>
									Esquilado{" "}
									<Icon source="lock-outline" size={18} />
								</>
							}
							labelPrefix="12"
							disabled={isPermitReadOnly}
						>
							<View pointerEvents="none">
								<Controller
									control={control}
									name="isSheared"
									render={({ field: { value } }) => (
										<ToggleButtonGroup
											value={value ? "Si" : "No"}
											onChange={() => {}}
											options={[
												{ label: "No", value: "No" },
												{ label: "Si", value: "Si" },
											]}
											disabled={isPermitReadOnly}
										/>
									)}
								/>
							</View>
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
									isLoadingScreenData ||
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
			)}
		</SafeAreaView>
	)
}
