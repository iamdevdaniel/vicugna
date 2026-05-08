import regionales from "@assets/data/regionales.json"
import { SimpleDropdown as Dropdown, LabeledInput } from "@components"
import { createForm11 } from "@database"
import type { Form11Shearing } from "@definitions/types"
import { yupResolver } from "@hookform/resolvers/yup"
import DateTimePicker from "@react-native-community/datetimepicker"
import {
	defaultValuesForm11Dehearing,
	defaultValuesForm11Shearing,
	schemaForm11Shearing,
} from "@utils/form11-schemas"
import { useAppTheme } from "@utils/useAppTheme"
import { router, Stack } from "expo-router"
import { useEffect, useState } from "react"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import {
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
								: "#E0E0E0",
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
								color: isActive ? "white" : "#757575",
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

// ROUTE /form11/shearing-form
export default function () {
	const theme = useAppTheme()

	const {
		control,
		watch,
		setValue,
		reset,
		formState: { errors, isValid },
		handleSubmit,
	} = useForm<Form11Shearing>({
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

	const [datePickerOpen, setDatePickerOpen] = useState(false)

	useEffect(() => {
		if (selectedDepartamento) {
			const dept =
				regionales[selectedDepartamento as keyof typeof regionales]
			setRegionalOptions(
				dept.regionales.map((r) => ({ label: r.nombre, value: r.id })),
			)
			setValue("asociacionRegional", "")
			setValue("comunidadManejadora", "")
		} else {
			setRegionalOptions([])
			setComunidadOptions([])
		}
	}, [selectedDepartamento, setValue])

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
			setValue("comunidadManejadora", "")
		} else {
			setComunidadOptions([])
		}
	}, [selectedRegional, selectedDepartamento, setValue])

	const onSubmit: SubmitHandler<Form11Shearing> = async (
		dataForm11Shearing,
	) => {
		try {
			await createForm11(dataForm11Shearing, defaultValuesForm11Dehearing)
			reset()
			router.back()
		} catch (error) {
			console.error("Error saving form:", error)
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
								onSelect={onChange}
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
								onSelect={onChange}
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
								value={value}
								onChangeText={onChange}
								style={{
									borderWidth: 1,
									borderColor: "#ccc",
									borderRadius: 4,
									padding: 12,
									backgroundColor: "#fff",
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
										borderColor: "#ccc",
										borderRadius: 4,
										padding: 12,
										backgroundColor: "#fff",
									}}
								>
									<Text
										style={{
											color: value ? "#000" : "#999",
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
								value={value}
								onChangeText={onChange}
								style={{
									borderWidth: 1,
									borderColor: "#ccc",
									borderRadius: 4,
									padding: 12,
									backgroundColor: "#fff",
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
							onPress={() => reset()}
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
