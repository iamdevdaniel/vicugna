import {
	DateInput,
	LabeledInput,
	LoadingOverlay,
	ReadOnlyField,
	ReadOnlyNotice,
	TimeInput,
} from "@components"
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
import { useLocalSearchParams, useRouter } from "expo-router"
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
	const { data: permit, loading: loadingPermit } =
		useReadSinglePermit(permitId)
	const isPermitReadOnly = permit?.syncStatus === "synced"
	const { data, loading } = useReadSingleShearingHeader(permitId)
	const { updateShearingHeader, saving } = useSingleShearingHeaderActions()

	const {
		control,
		reset,
		formState: { errors, isValid },
		handleSubmit,
		trigger,
		watch,
	} = useForm<ShearingHeaderFormData>({
		mode: "onChange",
		defaultValues: defaultValuesShearingHeader,
		resolver: yupResolver(yupShearingHeader),
	})

	const startTime = watch("startTime")
	const endTime = watch("endTime")

	useEffect(() => {
		if (loading || !data) return
		if (!data.isCompleted) {
			reset(defaultValuesShearingHeader)
			return
		}

		reset({
			site: data.site,
			latitude: data.latitude.toString(),
			longitude: data.longitude.toString(),
			roundupCount: data.roundupCount.toString(),
			eventDate: data.eventDate,
			startTime: data.startTime,
			endTime: data.endTime,
		})
	}, [loading, reset, data])

	useEffect(() => {
		if (!startTime || !endTime) {
			return
		}

		void trigger("endTime")
	}, [endTime, startTime, trigger])

	const onSubmit = async (formData: ShearingHeaderFormData) => {
		if (data) {
			const ok = await updateShearingHeader(data.id, {
				...formData,
				latitude: Number(formData.latitude),
				longitude: Number(formData.longitude),
				roundupCount: Number(formData.roundupCount),
			})
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

	if (loadingPermit || loading) {
		return (
			<SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
				<LoadingOverlay message="Cargando información..." />
			</SafeAreaView>
		)
	}

	if (isPermitReadOnly && data) {
		return (
			<SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
				<ScrollView
					style={{ flex: 1 }}
					contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
				>
					<ReadOnlyNotice />
					<ReadOnlyField
						label="Sitio"
						labelPrefix="1"
						value={data.site}
					/>
					<ReadOnlyField
						label="Latitud"
						labelPrefix="2"
						value={data.latitude.toString()}
					/>
					<ReadOnlyField
						label="Longitud"
						labelPrefix="3"
						value={data.longitude.toString()}
					/>
					<ReadOnlyField
						label="Cantidad de arreos"
						labelPrefix="4"
						value={data.roundupCount.toString()}
					/>
					<ReadOnlyField
						label="Fecha"
						labelPrefix="5"
						value={data.eventDate}
					/>
					<ReadOnlyField
						label="Hora inicial"
						labelPrefix="6"
						value={data.startTime}
					/>
					<ReadOnlyField
						label="Hora conclusión"
						labelPrefix="7"
						value={data.endTime}
					/>
				</ScrollView>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior="height"
				keyboardVerticalOffset={100}
			>
				<ScrollView
					style={{ flex: 1 }}
					contentContainerStyle={{
						padding: 20,
						paddingBottom: 20,
					}}
					keyboardShouldPersistTaps="handled"
				>
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

					<View style={{ flexDirection: "row", gap: 12 }}>
						<View style={{ flex: 1 }}>
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
											value={value}
											onChangeText={onChange}
											onBlur={onBlur}
											keyboardType="numeric"
											error={!!errors.latitude}
											disabled={isPermitReadOnly}
										/>
									)}
								/>
							</LabeledInput>
						</View>

						<View style={{ flex: 1 }}>
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
											value={value}
											onChangeText={onChange}
											onBlur={onBlur}
											keyboardType="numeric"
											error={!!errors.longitude}
											disabled={isPermitReadOnly}
										/>
									)}
								/>
							</LabeledInput>
						</View>
					</View>

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
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									keyboardType="numeric"
									error={!!errors.roundupCount}
									disabled={isPermitReadOnly}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Fecha"
						labelPrefix="5"
						error={errors.eventDate?.message}
						disabled={isPermitReadOnly}
					>
						<Controller
							control={control}
							name="eventDate"
							render={({ field: { onChange, value } }) => (
								<DateInput
									value={value}
									onChange={onChange}
									error={!!errors.eventDate}
									disabled={isPermitReadOnly}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Hora inicial"
						labelPrefix="6"
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
									minuteInterval={5}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Hora conclusión"
						labelPrefix="7"
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
									minuteInterval={5}
								/>
							)}
						/>
					</LabeledInput>

					<View
						style={{
							flexDirection: "row",
							gap: 12,
							marginTop: 16,
						}}
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
