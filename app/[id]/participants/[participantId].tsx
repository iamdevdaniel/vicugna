import { LabeledInput, RadioGroup, SignaturePad } from "@components"
import {
	createParticipant,
	deleteParticipant,
	updateParticipant,
	useReadOneParticipant,
} from "@database"
import type { ParticipantFormData } from "@definitions/types"
import { yupResolver } from "@hookform/resolvers/yup"
import {
	defaultValuesParticipant,
	schemaParticipant,
} from "@utils/participants-yup"
import { useAppTheme } from "@utils/useAppTheme"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { Alert, KeyboardAvoidingView, ScrollView, View } from "react-native"
import { Button, TextInput } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

// PARTICIPANTS.FORM /[id]/participants/[participantId]
export default function () {
	const theme = useAppTheme()
	const router = useRouter()
	const { id, participantId } = useLocalSearchParams<{
		id: string
		participantId: string
	}>()
	const { data, loading } = useReadOneParticipant(participantId)

	const isEditForm = participantId !== "new"

	const {
		control,
		reset,
		formState: { errors, isValid },
		handleSubmit,
	} = useForm<ParticipantFormData>({
		mode: "onChange",
		defaultValues: defaultValuesParticipant,
		resolver: yupResolver(schemaParticipant),
	})

	useEffect(() => {
		if (loading || !data) return
		reset({
			nombre: data.nombre,
			apellidos: data.apellidos,
			genero: data.genero,
			cedulaIdentidad: data.cedulaIdentidad,
			firma: data.firma,
			notas: data.notas,
		})
	}, [loading, reset, data])

	const onSubmit = async (formData: ParticipantFormData) => {
		if (isEditForm) {
			await updateParticipant(participantId, formData)
		} else {
			await createParticipant(id, formData)
		}
		router.back()
	}

	const onDelete = () => {
		Alert.alert(
			"Eliminar participante",
			"¿Seguro que quieres eliminar este participante?",
			[
				{ text: "Cancelar", style: "cancel" },
				{
					text: "Eliminar",
					style: "destructive",
					onPress: async () => {
						await deleteParticipant(participantId)
						router.back()
					},
				},
			],
		)
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
						title: isEditForm
							? "Editar participante"
							: "Nuevo participante",
					}}
				/>
				<ScrollView
					style={{ flex: 1 }}
					contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
					keyboardShouldPersistTaps="handled"
				>
					<LabeledInput
						label="Nombre"
						labelPrefix="1"
						error={errors.nombre?.message}
					>
						<Controller
							control={control}
							name="nombre"
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<TextInput
									mode="outlined"
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									error={!!errors.nombre}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Apellidos"
						labelPrefix="2"
						error={errors.apellidos?.message}
					>
						<Controller
							control={control}
							name="apellidos"
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<TextInput
									mode="outlined"
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									error={!!errors.apellidos}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Género"
						labelPrefix="3"
						error={errors.genero?.message}
					>
						<Controller
							control={control}
							name="genero"
							render={({ field: { onChange, value } }) => (
								<RadioGroup
									value={value}
									onChange={onChange}
									options={[
										{ label: "Masculino", value: "M" },
										{ label: "Femenino", value: "F" },
									]}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Cédula de Identidad"
						labelPrefix="4"
						error={errors.cedulaIdentidad?.message}
					>
						<Controller
							control={control}
							name="cedulaIdentidad"
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<TextInput
									mode="outlined"
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									keyboardType="numeric"
									error={!!errors.cedulaIdentidad}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Firma"
						labelPrefix="5"
						error={errors.firma?.message}
					>
						<Controller
							control={control}
							name="firma"
							render={({ field: { onChange, value } }) => (
								<SignaturePad
									value={value}
									onChange={onChange}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Notas"
						labelPrefix="6"
						error={errors.notas?.message}
					>
						<Controller
							control={control}
							name="notas"
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<TextInput
									mode="outlined"
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									multiline
									style={{ height: 100 }}
									contentStyle={{
										height: 115,
										textAlignVertical: "top",
									}}
									error={!!errors.notas}
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
							disabled={!isValid}
							style={{ flex: 1 }}
						>
							{isEditForm ? "Actualizar" : "Guardar"}
						</Button>

						<Button
							mode="outlined"
							onPress={() => reset(defaultValuesParticipant)}
							style={{ flex: 1 }}
						>
							Limpiar
						</Button>
					</View>
					{isEditForm && (
						<Button
							mode="contained"
							onPress={onDelete}
							style={{
								flex: 1,
								backgroundColor: theme.colors.custom.crimson,
								marginTop: 16,
							}}
							textColor={theme.colors.onError}
						>
							Borrar
						</Button>
					)}
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}
