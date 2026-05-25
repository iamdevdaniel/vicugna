import regionales from "@assets/data/regionales.json"
import { SimpleDropdown as Dropdown, LabeledInput } from "@components"
import { updateShearingForm, useReadOneForm11 } from "@database"
import type { Form11ShearingFormData } from "@definitions/types"
import { yupResolver } from "@hookform/resolvers/yup"
import DateTimePicker from "@react-native-community/datetimepicker"
import {
	defaultValuesForm11Shearing,
	schemaForm11Shearing,
} from "@utils/form11-yup"
import { useAppTheme } from "@utils/useAppTheme"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import {
	Alert,
	KeyboardAvoidingView,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native"
import { Button } from "react-native-paper"

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
	const theme = useAppTheme()
	const steps = [1, 2, 3]
	return (
		<View
			style={{
				flexDirection: "row",
				alignItems: "center",
				marginRight: 12,
			}}
		>
			{steps.map((step) => {
				const isActive = step <= currentStep
				return (
					<View
						key={step}
						style={{
							backgroundColor: isActive
								? theme.colors.custom.green
								: theme.colors.custom.lightGray,
							width: 24,
							height: 24,
							borderRadius: 4,
							justifyContent: "center",
							alignItems: "center",
							marginRight: step < 3 ? 6 : 0,
						}}
					>
						<Text
							style={{
								color: isActive
									? theme.colors.custom.white
									: theme.colors.custom.darkGray,
								fontSize: 12,
								fontWeight: "bold",
							}}
						>
							{step}
						</Text>
					</View>
				)
			})}
		</View>
	)
}

// FORM11.SHEARING /[id]/form11/[id]/shearing
export default function () {
	const theme = useAppTheme()
	const { id } = useLocalSearchParams()
	const router = useRouter()
	const {
		control,
		watch,
		setValue,
		reset,
		formState: { errors, isValid },
		handleSubmit,
	} = useForm({
		mode: "onChange",
		defaultValues: defaultValuesForm11Shearing,
		resolver: yupResolver(schemaForm11Shearing),
	})

	const [regionalOptions, setRegionalOptions] = useState<
		Array<{ label: string; value: string }>
	>([])
	const [comunidadOptions, setComunidadOptions] = useState<
		Array<{ label: string; value: string }>
	>([])

	const selectedDepartamento = watch("departamento")
	const selectedRegional = watch("asociacionRegional")

	const departamentoOptions = Object.keys(regionales).map((key) => ({
		label: key,
		value: key,
	}))

	const { data: form } = useReadOneForm11(id as string)

	useEffect(() => {
		if (form?.shearing) {
			const { isCompleted: _, ...formData } = form.shearing
			reset(formData)
		}
	}, [form, reset])

	const [datePickerOpen, setDatePickerOpen] = useState(false)

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

	const onSubmit = async (data: Form11ShearingFormData) => {
		try {
			await updateShearingForm(id as string, data, true)
		} catch {
			Alert.alert("Error", "No se pudo guardar el formulario")
		} finally {
			router.back()
		}
	}

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={"height"}
			keyboardVerticalOffset={100}
		>
			<Stack.Screen
				options={{
					headerTitle: () => (
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
							}}
						>
							<StepIndicator currentStep={1} />
							<Text
								style={{
									fontWeight: "bold",
									fontSize: 18,
									color: theme.colors.onSurface,
								}}
							>
								Formulario de captura
							</Text>
						</View>
					),
				}}
			/>
			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
				keyboardShouldPersistTaps="handled"
			>
				<LabeledInput
					label="Departamento"
					labelPrefix="1"
					error={errors.departamento?.message}
				>
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
					label="Comunidad Manejadora"
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
								style={{
									borderWidth: 1,
									borderColor: theme.colors.outlineVariant,
									borderRadius: 4,
									padding: 12,
									backgroundColor: theme.colors.custom.white,
									color: theme.colors.onSurface,
								}}
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
				<LabeledInput
					label="Código de Autorización"
					labelPrefix="6"
					error={errors.codigoAutorizacion?.message}
				>
					<Controller
						control={control}
						name="codigoAutorizacion"
						render={({ field: { onChange, value } }) => (
							<TextInput
								placeholder="Ingrese código"
								placeholderTextColor={
									theme.colors.onSurfaceVariant
								}
								value={value}
								onChangeText={onChange}
								style={{
									borderWidth: 1,
									borderColor: theme.colors.outlineVariant,
									borderRadius: 4,
									padding: 12,
									backgroundColor: theme.colors.custom.white,
									color: theme.colors.onSurface,
								}}
							/>
						)}
					/>
				</LabeledInput>
				<View
					style={{
						flexDirection: "row",
						justifyContent: "space-between",
						marginTop: 24,
						marginBottom: 24,
					}}
				>
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
							onPress={() => reset(defaultValuesForm11Shearing)}
							style={{ flex: 1, marginHorizontal: 4 }}
						>
							<Text>LIMPIAR</Text>
						</Button>
					</View>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
