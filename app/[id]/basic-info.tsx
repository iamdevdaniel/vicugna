import regionals from "@assets/data/regionals.json"
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

	const selectedDepartamento = watch("departament")
	const selectedRegional = watch("regional")

	useEffect(() => {
		if (loading || !data) return
		reset({
			departament: data.departament,
			regional: data.regional,
			community: data.community,
			site: data.site,
			date: data.date,
		})
	}, [loading, reset, data])

	const departamentoOptions = Object.keys(regionals).map((key) => ({
		label: key,
		value: key,
	}))

	useEffect(() => {
		if (selectedDepartamento) {
			const dept =
				regionals[selectedDepartamento as keyof typeof regionals]
			setRegionalOptions(
				dept.regionals.map((r) => ({ label: r.name, value: r.id })),
			)
		} else {
			setRegionalOptions([])
			setComunidadOptions([])
		}
	}, [selectedDepartamento])

	useEffect(() => {
		if (selectedRegional && selectedDepartamento) {
			const dept =
				regionals[selectedDepartamento as keyof typeof regionals]
			const regional = dept.regionals.find(
				(r) => r.id === selectedRegional,
			)
			if (regional) {
				setComunidadOptions(
					regional.communities.map((c) => ({
						label: c.name,
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
						name="departament"
						render={({ field: { onChange, value } }) => (
							<Dropdown
								placeholder="Seleccionar departamento"
								options={departamentoOptions}
								value={value}
								onSelect={(v) => {
									onChange(v)
									setValue("regional", "", {
										shouldValidate: true,
									})
									setValue("community", "", {
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
					error={errors.regional?.message}
				>
					<Controller
						control={control}
						name="regional"
						render={({ field: { onChange, value } }) => (
							<Dropdown
								placeholder="Seleccionar regional"
								options={regionalOptions}
								value={value}
								onSelect={(v) => {
									onChange(v)
									setValue("community", "", {
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
					error={errors.community?.message}
				>
					<Controller
						control={control}
						name="community"
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
					error={errors.site?.message}
				>
					<Controller
						control={control}
						name="site"
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
					error={errors.date?.message}
				>
					<Controller
						control={control}
						name="date"
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
