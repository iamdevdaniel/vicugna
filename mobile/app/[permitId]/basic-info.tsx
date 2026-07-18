import { LabeledInput } from "@components"
import type { BasicInfoFormData } from "@definitions/types"
import { yupResolver } from "@hookform/resolvers/yup"
import { useReadSingleBasicInfo, useSingleBasicInfoActions } from "@hooks"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useAppTheme } from "@utils/useAppTheme"
import { defaultValuesBasicInfo, yupBasicInfo } from "@utils/yup-basic-info"
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

// BASIC_INFO /[permitId]/basic-info
export default function () {
	const theme = useAppTheme()
	const router = useRouter()
	const { permitId } = useLocalSearchParams<{ permitId: string }>()
	const { data, loading } = useReadSingleBasicInfo(permitId)
	const { updateSingleBasicInfo, saving } = useSingleBasicInfoActions()

	const {
		control,
		reset,
		formState: { errors, isValid },
		handleSubmit,
	} = useForm<BasicInfoFormData>({
		mode: "onChange",
		defaultValues: defaultValuesBasicInfo,
		resolver: yupResolver(yupBasicInfo),
	})

	const [datePickerOpen, setDatePickerOpen] = useState(false)

	useEffect(() => {
		if (loading || !data) return
		reset({
			site: data.site,
			date: data.date,
		})
	}, [loading, reset, data])

	const onSubmit = async (formData: BasicInfoFormData) => {
		if (!data) return
		const ok = await updateSingleBasicInfo(data.id, formData)
		if (ok) {
			router.back()
		} else {
			Alert.alert("Error", "No se pudo actualizar la información básica")
		}
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
				<LabeledInput
					label="Sitio de Captura"
					labelPrefix="1"
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
					labelPrefix="2"
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
						disabled={!isValid || saving}
						style={{ flex: 1, marginHorizontal: 4 }}
						loading={saving}
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
