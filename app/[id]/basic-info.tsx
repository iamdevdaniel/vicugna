import regionales from "@assets/data/regionales.json"
import { SimpleDropdown as Dropdown, LabeledInput } from "@components"
import { updateBasicInfo, useReadBasicInfo } from "@database"
import type { BasicInfoFormData } from "@definitions/types"
import { yupResolver } from "@hookform/resolvers/yup"
import DateTimePicker from "@react-native-community/datetimepicker"
import { defaultValuesBasicInfo, schemaBasicInfo } from "@utils/basic-info-yup"
import { useAppTheme } from "@utils/useAppTheme"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import {
	KeyboardAvoidingView,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native"
import { Button } from "react-native-paper"

// BASIC_INFO /[id]/basic-info
export default function () {
	const theme = useAppTheme()
	const router = useRouter()
	const { id } = useLocalSearchParams<{ id: string }>()
	const { data, loading } = useReadBasicInfo(id)

	const {
		control,
		watch,
		setValue,
		reset,
		formState: { errors, isValid },
		handleSubmit,
	} = useForm<BasicInfoFormData>({
		mode: "onChange",
		defaultValues: defaultValuesBasicInfo,
		resolver: yupResolver(schemaBasicInfo),
	})

	const [regionalOptions, setRegionalOptions] = useState<
		Array<{ label: string; value: string }>
	>([])
	const [comunidadOptions, setComunidadOptions] = useState<
		Array<{ label: string; value: string }>
	>([])
	const [datePickerOpen, setDatePickerOpen] = useState(false)

	const selectedDepartamento = watch("departamento")
	const selectedRegional = watch("asociacionRegional")

	useEffect(() => {
		if (loading || !data) return
		reset({
			departamento: data.departamento,
			asociacionRegional: data.asociacionRegional,
			comunidadManejadora: data.comunidadManejadora,
			sitioCaptura: data.sitioCaptura,
			fechaCaptura: data.fechaCaptura,
		})
	}, [loading, reset, data])

	const departamentoOptions = Object.keys(regionales).map((key) => ({
		label: key,
		value: key,
	}))

	useEffect(() => {
		if (selectedDepartamento) {
			const dept =
				regionales[selectedDepartamento as keyof typeof regionales]
			setRegionalOptions(
				dept.regionales.map((r) => ({ label: r.nombre, value: r.id })),
			)
		} else {
			setRegionalOptions([])
			setComunidadOptions([])
		}
	}, [selectedDepartamento])

	useEffect(() => {
		if (selectedRegional && selectedDepartamento) {
			const dept =
				regionales[selectedDepartamento as keyof typeof regionales]
			const regional = dept.regionales.find(
				(r) => r.id === selectedRegional,
			)
			if (regional) {
				setComunidadOptions(
					regional.comunidades.map((c) => ({
						label: c.nombre,
						value: c.id,
					})),
				)
			}
		} else {
			setComunidadOptions([])
		}
	}, [selectedRegional, selectedDepartamento])

	const onSubmit = async (formData: BasicInfoFormData) => {
		if (!data) return
		await updateBasicInfo(data.id, formData).then(() => {
			router.back()
		})
	}

	const inputStyle = {
		borderWidth: 1,
		borderColor: theme.colors.outlineVariant,
		borderRadius: 4,
		padding: 12,
		backgroundColor: theme.colors.custom.white,
		color: theme.colors.onSurface,
	}

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior="height"
			keyboardVerticalOffset={100}
		>
			<Stack.Screen options={{ title: "Información Básica" }} />
			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
				keyboardShouldPersistTaps="handled"
			>
				<LabeledInput label="Departamento" labelPrefix="1">
					<Controller
						control={control}
						name="departamento"
						render={({ field: { onChange, value } }) => (
							<Dropdown
								placeholder="Seleccionar departamento"
								options={departamentoOptions}
								value={value}
								onSelect={(v) => {
									onChange(v)
									setValue("asociacionRegional", "", {
										shouldValidate: true,
									})
									setValue("comunidadManejadora", "", {
										shouldValidate: true,
									})
								}}
							/>
						)}
					/>
				</LabeledInput>

				<LabeledInput
					label="Asociación Regional"
					labelPrefix="2"
					error={errors.asociacionRegional?.message}
				>
					<Controller
						control={control}
						name="asociacionRegional"
						render={({ field: { onChange, value } }) => (
							<Dropdown
								placeholder="Seleccionar regional"
								options={regionalOptions}
								value={value}
								onSelect={(v) => {
									onChange(v)
									setValue("comunidadManejadora", "", {
										shouldValidate: true,
									})
								}}
								disabled={!selectedDepartamento}
							/>
						)}
					/>
				</LabeledInput>

				<LabeledInput
					label="Comunidad Manejadora de Vicuñas"
					labelPrefix="3"
					error={errors.comunidadManejadora?.message}
				>
					<Controller
						control={control}
						name="comunidadManejadora"
						render={({ field: { onChange, value } }) => (
							<Dropdown
								placeholder="Seleccionar comunidad"
								options={comunidadOptions}
								value={value}
								onSelect={onChange}
								disabled={!selectedRegional}
							/>
						)}
					/>
				</LabeledInput>

				<LabeledInput
					label="Sitio de Captura"
					labelPrefix="4"
					error={errors.sitioCaptura?.message}
				>
					<Controller
						control={control}
						name="sitioCaptura"
						render={({ field: { onChange, value } }) => (
							<TextInput
								placeholder="Ingrese sitio de captura"
								placeholderTextColor={
									theme.colors.onSurfaceVariant
								}
								value={value}
								onChangeText={onChange}
								style={inputStyle}
							/>
						)}
					/>
				</LabeledInput>

				<LabeledInput
					label="Fecha de Captura"
					labelPrefix="5"
					error={errors.fechaCaptura?.message}
				>
					<Controller
						control={control}
						name="fechaCaptura"
						render={({ field: { onChange, value } }) => (
							<>
								<Pressable
									onPress={() => setDatePickerOpen(true)}
									style={{
										borderWidth: 1,
										borderColor:
											theme.colors.outlineVariant,
										borderRadius: 4,
										padding: 12,
										backgroundColor:
											theme.colors.custom.white,
									}}
								>
									<Text
										style={{
											color: value
												? theme.colors.onSurface
												: theme.colors.onSurfaceVariant,
										}}
									>
										{value || "DD/MM/YYYY"}
									</Text>
								</Pressable>
								{datePickerOpen && (
									<DateTimePicker
										value={
											value
												? new Date(
														value
															.split("/")
															.reverse()
															.join("-"),
													)
												: new Date()
										}
										mode="date"
										display="default"
										onChange={(event, selectedDate) => {
											setDatePickerOpen(false)
											if (
												event.type === "set" &&
												selectedDate
											) {
												onChange(
													selectedDate.toLocaleDateString(
														"es-ES",
													),
												)
											}
										}}
									/>
								)}
							</>
						)}
					/>
				</LabeledInput>

				<View
					style={{
						flexDirection: "row",
						justifyContent: "center",
						alignItems: "center",
						width: "100%",
						marginTop: 24,
						marginBottom: 24,
					}}
				>
					<Button
						mode="contained"
						onPress={handleSubmit(onSubmit)}
						disabled={!isValid}
						style={{ flex: 1, marginHorizontal: 4 }}
					>
						GUARDAR
					</Button>
					<Button
						mode="outlined"
						onPress={() => {
							reset(defaultValuesBasicInfo)
						}}
						style={{ flex: 1, marginHorizontal: 4 }}
					>
						LIMPIAR
					</Button>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
