import { LabeledInput } from "@components"
import { updateShearingHeader, useReadShearingHeader } from "@database"
import type { ShearingHeaderFormData } from "@definitions/types"
import { yupResolver } from "@hookform/resolvers/yup"
import DateTimePicker, {
	type DateTimePickerEvent,
} from "@react-native-community/datetimepicker"
import { useAppTheme } from "@utils/useAppTheme"
import {
	defaultValuesShearingHeader,
	yupShearingHeader,
} from "@utils/yup-shearing-header"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import {
	KeyboardAvoidingView,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native"
import { Button, IconButton, TextInput } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

const formatTime = (time: string) => {
	if (!time) return null
	const [hours, minutes] = time.split(":").map(Number)
	const period = hours >= 12 ? "PM" : "AM"
	const h = hours % 12 || 12
	return `${h}:${minutes.toString().padStart(2, "0")} ${period}`
}

export default function () {
	const theme = useAppTheme()
	const router = useRouter()
	const { id } = useLocalSearchParams<{
		id: string
		headerId: string
	}>()
	const { data, loading } = useReadShearingHeader(id)

	const {
		control,
		reset,
		formState: { errors, isValid },
		handleSubmit,
	} = useForm<ShearingHeaderFormData>({
		mode: "onChange",
		defaultValues: defaultValuesShearingHeader,
		resolver: yupResolver(yupShearingHeader),
	})

	useEffect(() => {
		if (loading || !data) return
		reset({
			site: data.site,
			latitude: data.latitude,
			longitude: data.longitude,
			roundupCount: data.roundupCount,
			startTime: data.startTime,
			endTime: data.endTime,
		})
	}, [loading, reset, data])

	const onSubmit = async (formData: ShearingHeaderFormData) => {
		if (data) {
			updateShearingHeader(data.id, formData).then(() => {
				router.back()
			})
		}
	}

	const [showStartPicker, setShowStartPicker] = useState<boolean>(false)
	const [showEndPicker, setShowEndPicker] = useState<boolean>(false)

	return (
		<SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior="height"
				keyboardVerticalOffset={100}
			>
				<Stack.Screen
					options={{
						title: "Datos de esquila",
					}}
				/>
				<ScrollView
					style={{ flex: 1 }}
					contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
					keyboardShouldPersistTaps="handled"
				>
					<LabeledInput
						label="Sitio"
						labelPrefix="1"
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
						label="Latitud"
						labelPrefix="2"
						error={errors.latitude?.message}
					>
						<Controller
							control={control}
							name="latitude"
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<TextInput
									mode="outlined"
									value={value?.toString()}
									onChangeText={(text) =>
										onChange(Number(text))
									}
									onBlur={onBlur}
									keyboardType="numeric"
									error={!!errors.latitude}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Longitud"
						labelPrefix="3"
						error={errors.longitude?.message}
					>
						<Controller
							control={control}
							name="longitude"
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<TextInput
									mode="outlined"
									value={value?.toString()}
									onChangeText={(text) =>
										onChange(Number(text))
									}
									onBlur={onBlur}
									keyboardType="numeric"
									error={!!errors.longitude}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Cantidad de encierros"
						labelPrefix="4"
						error={errors.roundupCount?.message}
					>
						<Controller
							control={control}
							name="roundupCount"
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<TextInput
									mode="outlined"
									value={value?.toString()}
									onChangeText={(text) =>
										onChange(Number(text))
									}
									onBlur={onBlur}
									keyboardType="numeric"
									error={!!errors.roundupCount}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Hora de inicio"
						labelPrefix="5"
						error={errors.startTime?.message}
					>
						<Controller
							control={control}
							name="startTime"
							render={({ field: { onChange, value } }) => (
								<>
									<Pressable
										onPress={() => setShowStartPicker(true)}
										style={{
											flexDirection: "row",
											alignItems: "center",
											justifyContent: "space-between",
											borderWidth: 1,
											borderColor: errors.startTime
												? theme.colors.error
												: theme.colors.outline,
											borderRadius: 4,
											paddingHorizontal: 12,
											height: 56, // Standard height for RNP outlined inputs
											backgroundColor:
												theme.colors.surface,
											marginVertical: 4,
										}}
									>
										<Text
											style={{
												fontSize: 16,
												color: value
													? theme.colors.onSurface
													: theme.colors.custom
															.lightGray,
											}}
										>
											{formatTime(value) ??
												"Seleccionar hora"}
										</Text>
										<IconButton
											icon="clock-outline"
											size={24}
											iconColor={
												theme.colors.onSurfaceVariant
											}
											style={{ margin: 0 }}
										/>
									</Pressable>
									{showStartPicker && (
										<DateTimePicker
											value={
												value
													? new Date(
															`1970-01-01T${value}:00`,
														)
													: new Date()
											}
											mode="time"
											is24Hour={true}
											display="spinner"
											locale="es-ES"
											positiveButton={{
												label: "Aceptar",
												textColor: theme.colors.primary,
											}}
											negativeButton={{
												label: "Cancelar",
												textColor: theme.colors.error,
											}}
											onChange={(
												event: DateTimePickerEvent,
												selectedDate?: Date,
											) => {
												setShowStartPicker(false)
												if (
													event.type === "set" &&
													selectedDate
												) {
													const hours = selectedDate
														.getHours()
														.toString()
														.padStart(2, "0")
													const minutes = selectedDate
														.getMinutes()
														.toString()
														.padStart(2, "0")
													onChange(
														`${hours}:${minutes}`,
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
						label="Hora de fin"
						labelPrefix="6"
						error={errors.endTime?.message}
					>
						<Controller
							control={control}
							name="endTime"
							render={({ field: { onChange, value } }) => (
								<>
									<Pressable
										onPress={() => setShowEndPicker(true)}
										style={{
											flexDirection: "row",
											alignItems: "center",
											justifyContent: "space-between",
											borderWidth: 1,
											borderColor: errors.endTime
												? theme.colors.error
												: theme.colors.outline,
											borderRadius: 4,
											paddingHorizontal: 12,
											height: 56,
											backgroundColor:
												theme.colors.surface,
											marginVertical: 4,
										}}
									>
										<Text
											style={{
												fontSize: 16,
												color: value
													? theme.colors.onSurface
													: theme.colors.custom
															.lightGray,
											}}
										>
											{formatTime(value) ??
												"Seleccionar hora"}
										</Text>
										<IconButton
											icon="clock-outline"
											size={24}
											iconColor={
												theme.colors.onSurfaceVariant
											}
											style={{ margin: 0 }}
										/>
									</Pressable>
									{showEndPicker && (
										<DateTimePicker
											value={
												value
													? new Date(
															`1970-01-01T${value}:00`,
														)
													: new Date()
											}
											mode="time"
											is24Hour={true}
											display="spinner"
											locale="es-ES"
											positiveButton={{
												label: "Aceptar",
												textColor: theme.colors.primary,
											}}
											negativeButton={{
												label: "Cancelar",
												textColor: theme.colors.error,
											}}
											onChange={(
												event: DateTimePickerEvent,
												selectedDate?: Date,
											) => {
												setShowEndPicker(false)
												if (
													event.type === "set" &&
													selectedDate
												) {
													const hours = selectedDate
														.getHours()
														.toString()
														.padStart(2, "0")
													const minutes = selectedDate
														.getMinutes()
														.toString()
														.padStart(2, "0")
													onChange(
														`${hours}:${minutes}`,
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
						style={{ flexDirection: "row", gap: 12, marginTop: 16 }}
					>
						<Button
							mode="contained"
							onPress={handleSubmit(onSubmit)}
							disabled={!isValid}
							style={{ flex: 1 }}
						>
							Guardar
						</Button>
						<Button
							mode="outlined"
							onPress={() => reset(defaultValuesShearingHeader)}
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
