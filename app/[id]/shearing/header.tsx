import { LabeledInput, TimeInput } from "@components"
import type { ShearingHeaderFormData } from "@definitions/types"
import { yupResolver } from "@hookform/resolvers/yup"
import {
	useReadSingleShearingHeader,
	useSingleShearingHeaderActions,
} from "@hooks"
import {
	defaultValuesShearingHeader,
	yupShearingHeader,
} from "@utils/yup-shearing-header"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { KeyboardAvoidingView, ScrollView, View } from "react-native"
import { Button, TextInput } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

export default function () {
	const router = useRouter()
	const { id } = useLocalSearchParams<{
		id: string
		headerId: string
	}>()
	const { data, loading } = useReadSingleShearingHeader(id)
	const { updateShearingHeader, saving } = useSingleShearingHeaderActions()

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
			const ok = await updateShearingHeader(data.id, formData)
			if (ok) {
				router.back()
			}
		}
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
								<TimeInput
									value={value}
									onChange={onChange}
									error={!!errors.startTime}
								/>
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
								<TimeInput
									value={value}
									onChange={onChange}
									error={!!errors.endTime}
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
