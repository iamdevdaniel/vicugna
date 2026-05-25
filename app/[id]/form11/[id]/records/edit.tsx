import { LabeledInput, RadioGroup } from "@components"
import {
	createForm11Record,
	updateForm11Record,
	useReadOneForm11Record,
} from "@database"
import type { Form11RecordFormData } from "@definitions/types"
import { yupResolver } from "@hookform/resolvers/yup"
import {
	defaultValuesForm11Record,
	schemaForm11Record,
} from "@utils/form11-yup"
import { useAppTheme } from "@utils/useAppTheme"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import {
	Alert,
	KeyboardAvoidingView,
	ScrollView,
	TextInput,
} from "react-native"
import { Button } from "react-native-paper"

// FORM11.RECORDS.EDIT /form11/[id]/records/edit
// Query params: recordId (optional — omit for new record)
export default function () {
	const theme = useAppTheme()
	const router = useRouter()
	const { id, recordId } = useLocalSearchParams<{
		id: string
		recordId?: string
	}>()

	const isEditing = !!recordId
	const { data: existing } = useReadOneForm11Record(recordId ?? null)

	const {
		control,
		reset,
		formState: { errors, isValid },
		handleSubmit,
	} = useForm<Form11RecordFormData>({
		mode: "onChange",
		defaultValues: defaultValuesForm11Record,
		resolver: yupResolver(schemaForm11Record),
	})

	useEffect(() => {
		if (existing) reset(existing)
	}, [existing, reset])

	const inputStyle = {
		borderWidth: 1,
		borderColor: theme.colors.outlineVariant,
		borderRadius: 4,
		padding: 12,
		backgroundColor: theme.colors.custom.white,
		color: theme.colors.onSurface,
	}

	const onSubmit = async (data: Form11RecordFormData) => {
		try {
			if (isEditing && recordId) {
				await updateForm11Record(recordId, data)
			} else {
				await createForm11Record(id, data)
			}
		} catch {
			Alert.alert("Error", "No se pudo guardar el registro")
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
			<Stack.Screen
				options={{
					title: isEditing ? "Editar Registro" : "Nuevo Registro",
				}}
			/>
			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
				keyboardShouldPersistTaps="handled"
			>
				<LabeledInput
					label="Ficha"
					labelPrefix="1"
					error={errors.ficha?.message}
				>
					<Controller
						control={control}
						name="ficha"
						render={({ field: { onChange, value } }) => (
							<TextInput
								placeholder="Ingrese número de ficha"
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
					label="Peso Fibra Bruto (kg)"
					labelPrefix="2"
					error={errors.pesoFibraBruto?.message}
				>
					<Controller
						control={control}
						name="pesoFibraBruto"
						render={({ field: { onChange, value } }) => (
							<TextInput
								placeholder="0.00"
								placeholderTextColor={
									theme.colors.onSurfaceVariant
								}
								value={value}
								onChangeText={onChange}
								keyboardType="decimal-pad"
								style={inputStyle}
							/>
						)}
					/>
				</LabeledInput>

				<LabeledInput
					label="Peso Vellón Limpio (kg)"
					labelPrefix="3"
					error={errors.pesoVellonLimpio?.message}
				>
					<Controller
						control={control}
						name="pesoVellonLimpio"
						render={({ field: { onChange, value } }) => (
							<TextInput
								placeholder="0.00"
								placeholderTextColor={
									theme.colors.onSurfaceVariant
								}
								value={value}
								onChangeText={onChange}
								keyboardType="decimal-pad"
								style={inputStyle}
							/>
						)}
					/>
				</LabeledInput>

				<LabeledInput
					label="Peso Braga (kg)"
					labelPrefix="4"
					error={errors.pesoBraga?.message}
				>
					<Controller
						control={control}
						name="pesoBraga"
						render={({ field: { onChange, value } }) => (
							<TextInput
								placeholder="0.00"
								placeholderTextColor={
									theme.colors.onSurfaceVariant
								}
								value={value}
								onChangeText={onChange}
								keyboardType="decimal-pad"
								style={inputStyle}
							/>
						)}
					/>
				</LabeledInput>

				<LabeledInput
					label="Peso Total Fibra (kg)"
					labelPrefix="5"
					error={errors.pesoTotalFibra?.message}
				>
					<Controller
						control={control}
						name="pesoTotalFibra"
						render={({ field: { onChange, value } }) => (
							<TextInput
								placeholder="0.00"
								placeholderTextColor={
									theme.colors.onSurfaceVariant
								}
								value={value}
								onChangeText={onChange}
								keyboardType="decimal-pad"
								style={inputStyle}
							/>
						)}
					/>
				</LabeledInput>

				<LabeledInput
					label="Peso Fibra Predescerdada (kg)"
					labelPrefix="6"
					error={errors.pesoFibraPredescerdada?.message}
				>
					<Controller
						control={control}
						name="pesoFibraPredescerdada"
						render={({ field: { onChange, value } }) => (
							<TextInput
								placeholder="0.00"
								placeholderTextColor={
									theme.colors.onSurfaceVariant
								}
								value={value}
								onChangeText={onChange}
								keyboardType="decimal-pad"
								style={inputStyle}
							/>
						)}
					/>
				</LabeledInput>

				<LabeledInput
					label="Peso Cerda (kg)"
					labelPrefix="7"
					error={errors.pesoCerda?.message}
				>
					<Controller
						control={control}
						name="pesoCerda"
						render={({ field: { onChange, value } }) => (
							<TextInput
								placeholder="0.00"
								placeholderTextColor={
									theme.colors.onSurfaceVariant
								}
								value={value}
								onChangeText={onChange}
								keyboardType="decimal-pad"
								style={inputStyle}
							/>
						)}
					/>
				</LabeledInput>

				<LabeledInput
					label="Caspa"
					labelPrefix="8"
					error={errors.caspa?.message}
				>
					<Controller
						control={control}
						name="caspa"
						render={({ field: { onChange, value } }) => (
							<RadioGroup
								value={value}
								onChange={onChange}
								options={[
									{ label: "NO", value: "NO" },
									{ label: "SI", value: "SI" },
								]}
							/>
						)}
					/>
				</LabeledInput>

				<LabeledInput
					label="Nombre Predescerdador"
					labelPrefix="9"
					error={errors.nombrePredescerdador?.message}
				>
					<Controller
						control={control}
						name="nombrePredescerdador"
						render={({ field: { onChange, value } }) => (
							<TextInput
								placeholder="Ingrese nombre"
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

				<Button
					mode="contained"
					onPress={handleSubmit(onSubmit)}
					disabled={!isValid}
					style={{ marginTop: 24, marginBottom: 12 }}
				>
					GUARDAR
				</Button>
				<Button
					mode="outlined"
					onPress={() => reset(defaultValuesForm11Record)}
					style={{ marginBottom: 24 }}
				>
					LIMPIAR
				</Button>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
