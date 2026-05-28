import { LabeledInput } from "@components"
import { updateDehearingForm, useReadOneForm11 } from "@database"
import type { Form11DehearingFormData } from "@definitions/types"
import { yupResolver } from "@hookform/resolvers/yup"
import DateTimePicker from "@react-native-community/datetimepicker"
import {
	defaultValuesForm11Dehearing,
	schemaForm11Dehearing,
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

// FORM11.DEHEARING /form11/[id]/dehearing
export default function () {
	const theme = useAppTheme()
	const { id } = useLocalSearchParams()
	const router = useRouter()
	const {
		control,
		reset,
		formState: { errors, isValid },
		handleSubmit,
	} = useForm({
		mode: "onChange",
		defaultValues: defaultValuesForm11Dehearing,
		resolver: yupResolver(schemaForm11Dehearing),
	})

	const { data: form } = useReadOneForm11(id as string)

	useEffect(() => {
		if (form?.dehearing) {
			const { isCompleted: _, ...formData } = form.dehearing
			reset(formData)
		}
	}, [form, reset])

	const [fechaInicioOpen, setFechaInicioOpen] = useState(false)
	const [fechaFinOpen, setFechaFinOpen] = useState(false)

	const onSubmit = async (data: Form11DehearingFormData) => {
		try {
			await updateDehearingForm(id as string, data, true)
		} catch {
			Alert.alert("Error", "No se pudo guardar el formulario")
		} finally {
			router.back()
		}
	}

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior="height"
			keyboardVerticalOffset={100}
		>
			<Stack.Screen options={{ title: "Formulario Predescerdado" }} />
			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
				keyboardShouldPersistTaps="handled"
			>
				<LabeledInput
					label="Fecha Inicio Predescerdado"
					labelPrefix="1"
					error={errors.startDate?.message}
				>
					<Controller
						control={control}
						name="startDate"
						render={({ field: { onChange, value } }) => (
							<>
								<Pressable
									onPress={() => setFechaInicioOpen(true)}
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
								{fechaInicioOpen && (
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
											setFechaInicioOpen(false)
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
					label="Fecha Fin Predescerdado"
					labelPrefix="2"
					error={errors.endDate?.message}
				>
					<Controller
						control={control}
						name="endDate"
						render={({ field: { onChange, value } }) => (
							<>
								<Pressable
									onPress={() => setFechaFinOpen(true)}
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
								{fechaFinOpen && (
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
											setFechaFinOpen(false)
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
					label="Lugar Predescerdado"
					labelPrefix="3"
					error={errors.site?.message}
				>
					<Controller
						control={control}
						name="site"
						render={({ field: { onChange, value } }) => (
							<TextInput
								placeholder="Ingrese lugar"
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
					label="Responsables Predescerdado"
					labelPrefix="4"
					error={errors.supervisors?.message}
				>
					<Controller
						control={control}
						name="supervisors"
						render={({ field: { onChange, value } }) => (
							<TextInput
								placeholder="Ingrese responsables"
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
						onPress={() => reset(defaultValuesForm11Dehearing)}
						style={{ flex: 1, marginHorizontal: 4 }}
					>
						<Text>LIMPIAR</Text>
					</Button>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
