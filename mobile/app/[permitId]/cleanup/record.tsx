import { HeaderBreadcrumb, LabeledInput, ReadOnlyNotice } from "@components"
import type { CleaningCommonFormData } from "@definitions/types"
import { yupResolver } from "@hookform/resolvers/yup"
import {
	useReadSingleCleaningCommon,
	useReadSinglePermit,
	useSingleCleaningCommonActions,
} from "@hooks"
import {
	defaultValuesCleaningCommon,
	yupCleaningCommon,
} from "@utils/yup-cleaning-record"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { Alert, KeyboardAvoidingView, ScrollView, View } from "react-native"
import { Button, TextInput } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

function formatNumber(value: number) {
	return Number.isFinite(value) ? value.toString() : ""
}

function parseNumber(value: string) {
	const digits = value.replace(/\D/g, "")
	return digits === "" ? Number.NaN : Number(digits)
}

export default function () {
	const router = useRouter()
	const { permitId, recordId } = useLocalSearchParams<{
		permitId: string
		recordId?: string
	}>()
	const isEditForm = !!recordId
	const { data: permit } = useReadSinglePermit(permitId)
	const isPermitReadOnly = permit?.isSynced === true
	const permitLabel = permit?.permitNumber ?? "Sin número"
	const { data, loading } = useReadSingleCleaningCommon(recordId)
	const { createSingleCleaningCommon, updateSingleCleaningCommon, saving } =
		useSingleCleaningCommonActions()

	const {
		control,
		reset,
		formState: { errors, isValid },
		handleSubmit,
	} = useForm<CleaningCommonFormData>({
		mode: "onChange",
		defaultValues: defaultValuesCleaningCommon,
		resolver: yupResolver(yupCleaningCommon),
	})

	useEffect(() => {
		if (loading || !data) return
		reset({
			fleeceNumber: data.fleeceNumber,
			grossWeight: data.grossWeight,
		})
	}, [data, loading, reset])

	const onSubmit = async (formData: CleaningCommonFormData) => {
		const ok = recordId
			? await updateSingleCleaningCommon(recordId, formData)
			: await createSingleCleaningCommon(permitId, formData)
		if (ok) {
			router.back()
		} else {
			Alert.alert("Error", "No se pudo guardar el registro")
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
						headerTitle: () => (
							<HeaderBreadcrumb
								parts={[permitLabel, "Limpieza", "Registros"]}
							/>
						),
					}}
				/>
				<ScrollView
					style={{ flex: 1 }}
					contentContainerStyle={{
						flexGrow: 1,
						padding: 20,
						paddingBottom: 20,
					}}
					keyboardShouldPersistTaps="handled"
				>
					{isPermitReadOnly && <ReadOnlyNotice />}
					<LabeledInput
						label="Nro de vellon"
						labelPrefix="1"
						error={errors.fleeceNumber?.message}
						disabled={isPermitReadOnly}
					>
						<Controller
							control={control}
							name="fleeceNumber"
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<TextInput
									mode="outlined"
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									autoCapitalize="words"
									error={!!errors.fleeceNumber}
									disabled={isPermitReadOnly}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Peso bruto"
						labelPrefix="2"
						labelSuffix="gramos"
						error={errors.grossWeight?.message}
						disabled={isPermitReadOnly}
					>
						<Controller
							control={control}
							name="grossWeight"
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<TextInput
									mode="outlined"
									value={formatNumber(value)}
									onChangeText={(text) =>
										onChange(parseNumber(text))
									}
									onBlur={onBlur}
									keyboardType="numeric"
									error={!!errors.grossWeight}
									disabled={isPermitReadOnly}
								/>
							)}
						/>
					</LabeledInput>

					<View style={{ marginTop: "auto", paddingTop: 16 }}>
						<Button
							mode="contained"
							onPress={handleSubmit(onSubmit)}
							disabled={
								isPermitReadOnly ||
								!isValid ||
								saving ||
								(isEditForm && (loading || !data))
							}
							loading={saving}
						>
							{isEditForm ? "Actualizar" : "Guardar"}
						</Button>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}
