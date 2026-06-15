import { LabeledInput } from "@components"
import type { CleaningHeaderFormData } from "@definitions/types"
import { yupResolver } from "@hookform/resolvers/yup"
import {
	useReadSingleCleaningHeader,
	useSingleCleaningHeaderActions,
} from "@hooks"
import DateTimePicker from "@react-native-community/datetimepicker"
import {
	defaultValuesCleaningHeader,
	yupCleaningHeader,
} from "@utils/yup-cleaning-header"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import {
	Alert,
	KeyboardAvoidingView,
	Pressable,
	ScrollView,
	View,
} from "react-native"
import { Button, TextInput } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

type DateField = "startDate" | "endDate"

function getDateValue(value: string) {
	return value ? new Date(value.split("/").reverse().join("-")) : new Date()
}

export default function () {
	const router = useRouter()
	const { permitId } = useLocalSearchParams<{ permitId: string }>()
	const { data, loading } = useReadSingleCleaningHeader(permitId)
	const { updateSingleCleaningHeader, saving } =
		useSingleCleaningHeaderActions()
	const [datePickerField, setDatePickerField] = useState<DateField | null>(
		null,
	)

	const {
		control,
		reset,
		formState: { errors, isValid },
		handleSubmit,
	} = useForm<CleaningHeaderFormData>({
		mode: "onChange",
		defaultValues: defaultValuesCleaningHeader,
		resolver: yupResolver(yupCleaningHeader),
	})

	useEffect(() => {
		if (loading || !data) return
		reset({
			startDate: data.startDate,
			endDate: data.endDate,
			site: data.site,
			supervisors: data.supervisors,
		})
	}, [loading, reset, data])

	const onSubmit = async (formData: CleaningHeaderFormData) => {
		if (!data) return
		const ok = await updateSingleCleaningHeader(data.id, formData)
		if (ok) {
			router.back()
		} else {
			Alert.alert("Error", "No se pudo actualizar la limpieza")
		}
	}

	return (
		<SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior="height"
				keyboardVerticalOffset={100}
			>
				<Stack.Screen options={{ title: "Datos de limpieza" }} />
				<ScrollView
					style={{ flex: 1 }}
					contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
					keyboardShouldPersistTaps="handled"
				>
					<LabeledInput
						label="Fecha inicio"
						labelPrefix="1"
						error={errors.startDate?.message}
					>
						<Controller
							control={control}
							name="startDate"
							render={({ field: { onChange, value } }) => (
								<>
									<Pressable
										onPress={() =>
											setDatePickerField("startDate")
										}
									>
										<TextInput
											mode="outlined"
											value={value}
											placeholder="DD/MM/YYYY"
											editable={false}
											error={!!errors.startDate}
											right={
												<TextInput.Icon icon="calendar" />
											}
										/>
									</Pressable>
									{datePickerField === "startDate" && (
										<DateTimePicker
											value={getDateValue(value)}
											mode="date"
											display="default"
											onChange={(event, selectedDate) => {
												setDatePickerField(null)
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
						label="Fecha conclusión"
						labelPrefix="2"
						error={errors.endDate?.message}
					>
						<Controller
							control={control}
							name="endDate"
							render={({ field: { onChange, value } }) => (
								<>
									<Pressable
										onPress={() =>
											setDatePickerField("endDate")
										}
									>
										<TextInput
											mode="outlined"
											value={value}
											placeholder="DD/MM/YYYY"
											editable={false}
											error={!!errors.endDate}
											right={
												<TextInput.Icon icon="calendar" />
											}
										/>
									</Pressable>
									{datePickerField === "endDate" && (
										<DateTimePicker
											value={getDateValue(value)}
											mode="date"
											display="default"
											onChange={(event, selectedDate) => {
												setDatePickerField(null)
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
						label="Lugar"
						labelPrefix="3"
						error={errors.site?.message}
					>
						<Controller
							control={control}
							name="site"
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<TextInput
									mode="outlined"
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									error={!!errors.site}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Responsables"
						labelPrefix="4"
						error={errors.supervisors?.message}
					>
						<Controller
							control={control}
							name="supervisors"
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<TextInput
									mode="outlined"
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									error={!!errors.supervisors}
								/>
							)}
						/>
					</LabeledInput>

					<View
						style={{ flexDirection: "row", gap: 12, marginTop: 16 }}
					>
						<Button
							mode="contained"
							onPress={handleSubmit(onSubmit)}
							disabled={!isValid || saving}
							style={{ flex: 1 }}
							loading={saving}
						>
							Guardar
						</Button>
						<Button
							mode="outlined"
							onPress={() => reset(defaultValuesCleaningHeader)}
							style={{ flex: 1 }}
						>
							Limpiar
						</Button>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}
