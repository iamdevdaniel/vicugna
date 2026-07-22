import { LabeledInput, ReadOnlyNotice, TimeInput } from "@components"
import type { ShearingHeaderFormData } from "@definitions/types"
import { yupResolver } from "@hookform/resolvers/yup"
import {
	useReadSinglePermit,
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
import { Alert, KeyboardAvoidingView, ScrollView, View } from "react-native"
import { Button, TextInput } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

export default function () {
	const router = useRouter()
	const { permitId } = useLocalSearchParams<{
		permitId: string
		headerId: string
	}>()
	const { data: permit } = useReadSinglePermit(permitId)
	const isPermitReadOnly = permit?.isSynced === true
	const { data, loading } = useReadSingleShearingHeader(permitId)
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
			} else {
				Alert.alert(
					"Error",
					"No se pudo actualizar la información básica",
				)
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
					contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
					keyboardShouldPersistTaps="handled"
				>
					{isPermitReadOnly && <ReadOnlyNotice />}
					<LabeledInput
						label="Sitio"
						labelPrefix="1"
						error={errors.site?.message}
						disabled={isPermitReadOnly}
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
									autoCapitalize="words"
									error={!!errors.site}
									disabled={isPermitReadOnly}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Latitud"
						labelPrefix="2"
						error={errors.latitude?.message}
						disabled={isPermitReadOnly}
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
									disabled={isPermitReadOnly}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Longitud"
						labelPrefix="3"
						error={errors.longitude?.message}
						disabled={isPermitReadOnly}
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
									disabled={isPermitReadOnly}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Cantidad de arreos"
						labelPrefix="4"
						error={errors.roundupCount?.message}
						disabled={isPermitReadOnly}
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
									disabled={isPermitReadOnly}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Hora de inicio"
						labelPrefix="5"
						error={errors.startTime?.message}
						disabled={isPermitReadOnly}
					>
						<Controller
							control={control}
							name="startTime"
							render={({ field: { onChange, value } }) => (
								<TimeInput
									value={value}
									onChange={onChange}
									error={!!errors.startTime}
									disabled={isPermitReadOnly}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Hora de fin"
						labelPrefix="6"
						error={errors.endTime?.message}
						disabled={isPermitReadOnly}
					>
						<Controller
							control={control}
							name="endTime"
							render={({ field: { onChange, value } }) => (
								<TimeInput
									value={value}
									onChange={onChange}
									error={!!errors.endTime}
									disabled={isPermitReadOnly}
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
							disabled={isPermitReadOnly || !isValid || saving}
							style={{ flex: 1 }}
							loading={saving}
						>
							Guardar
						</Button>
						<Button
							mode="outlined"
							onPress={() => reset(defaultValuesShearingHeader)}
							disabled={isPermitReadOnly}
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
