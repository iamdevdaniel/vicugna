import {
	DateInput,
	getTodayDateString,
	LabeledInput,
	LoadingOverlay,
	ReadOnlyField,
	ReadOnlyNotice,
} from "@components"
import type { CleaningHeaderFormData } from "@definitions/types"
import { yupResolver } from "@hookform/resolvers/yup"
import {
	useReadSingleCleaningHeader,
	useReadSinglePermit,
	useSingleCleaningHeaderActions,
} from "@hooks"
import {
	defaultValuesCleaningHeader,
	yupCleaningHeader,
} from "@utils/yup-cleaning-header"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { Alert, KeyboardAvoidingView, ScrollView, View } from "react-native"
import { Button, TextInput } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

export default function () {
	const router = useRouter()
	const { permitId } = useLocalSearchParams<{ permitId: string }>()
	const { data: permit, loading: loadingPermit } =
		useReadSinglePermit(permitId)
	const isPermitReadOnly = permit?.syncStatus === "synced"
	const { data, loading } = useReadSingleCleaningHeader(permitId)
	const { updateSingleCleaningHeader, saving } =
		useSingleCleaningHeaderActions()

	const {
		control,
		reset,
		setValue,
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
			Alert.alert("Error", "No se pudo actualizar el registro de fibra")
		}
	}

	if (loadingPermit || loading) {
		return (
			<SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
				<LoadingOverlay message="Cargando..." />
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
						label="Fecha inicio"
						labelPrefix="1"
						value={data.startDate}
					/>
					<ReadOnlyField
						label="Fecha conclusión"
						labelPrefix="2"
						value={data.endDate}
					/>
					<ReadOnlyField
						label="Lugar"
						labelPrefix="3"
						value={data.site}
					/>
					<ReadOnlyField
						label="Responsables"
						labelPrefix="4"
						value={data.supervisors}
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
						label="Fecha inicio"
						labelPrefix="1"
						error={errors.startDate?.message}
						disabled={isPermitReadOnly}
					>
						<Controller
							control={control}
							name="startDate"
							render={({ field: { onChange, value } }) => (
								<View style={{ flexDirection: "row", gap: 8 }}>
									<DateInput
										value={value}
										onChange={onChange}
										error={!!errors.startDate}
										disabled={isPermitReadOnly}
										style={{ flex: 1 }}
									/>
									<Button
										mode="outlined"
										compact
										style={{
											borderRadius: 4,
											minWidth: 82,
										}}
										contentStyle={{
											height: 56,
											alignItems: "center",
											justifyContent: "center",
										}}
										labelStyle={{
											fontSize: 15,
											lineHeight: 20,
											marginHorizontal: 8,
											marginVertical: 0,
											textAlignVertical: "center",
										}}
										disabled={isPermitReadOnly}
										onPress={() =>
											setValue(
												"startDate",
												getTodayDateString(),
												{
													shouldDirty: true,
													shouldValidate: true,
												},
											)
										}
									>
										Hoy
									</Button>
								</View>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Fecha conclusión"
						labelPrefix="2"
						error={errors.endDate?.message}
						disabled={isPermitReadOnly}
					>
						<Controller
							control={control}
							name="endDate"
							render={({ field: { onChange, value } }) => (
								<View style={{ flexDirection: "row", gap: 8 }}>
									<DateInput
										value={value}
										onChange={onChange}
										error={!!errors.endDate}
										disabled={isPermitReadOnly}
										style={{ flex: 1 }}
									/>
									<Button
										mode="outlined"
										compact
										style={{
											borderRadius: 4,
											minWidth: 82,
										}}
										contentStyle={{
											height: 56,
											alignItems: "center",
											justifyContent: "center",
										}}
										labelStyle={{
											fontSize: 15,
											lineHeight: 20,
											marginHorizontal: 8,
											marginVertical: 0,
											textAlignVertical: "center",
										}}
										disabled={isPermitReadOnly}
										onPress={() =>
											setValue(
												"endDate",
												getTodayDateString(),
												{
													shouldDirty: true,
													shouldValidate: true,
												},
											)
										}
									>
										Hoy
									</Button>
								</View>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Lugar"
						labelPrefix="3"
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
						label="Responsables"
						labelPrefix="4"
						error={errors.supervisors?.message}
						disabled={isPermitReadOnly}
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
									autoCapitalize="words"
									error={!!errors.supervisors}
									disabled={isPermitReadOnly}
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
							onPress={() => reset(defaultValuesCleaningHeader)}
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
