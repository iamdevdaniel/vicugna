import { LabeledInput, SignaturePad, ToggleButtonGroup } from "@components"
import type { ParticipantFormData } from "@definitions/types"
import { yupResolver } from "@hookform/resolvers/yup"
import { useReadSingleParticipant, useSingleParticipantActions } from "@hooks"
import { useAppTheme } from "@utils/useAppTheme"
import {
	defaultValuesParticipant,
	yupParticipant,
} from "@utils/yup-participants"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { Alert, KeyboardAvoidingView, ScrollView, View } from "react-native"
import { Button, TextInput } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

// PARTICIPANTS.FORM /[permitId]/participants/[participantId]
export default function () {
	const theme = useAppTheme()
	const router = useRouter()
	const { permitId, participantId } = useLocalSearchParams<{
		permitId: string
		participantId: string
	}>()
	const { data, loading } = useReadSingleParticipant(participantId)
	const {
		createSingleParticipant,
		updateSingleParticipant,
		deleteSingleParticipant,
		saving,
		deleting,
	} = useSingleParticipantActions()

	const isEditForm = participantId !== "new"

	const {
		control,
		reset,
		formState: { errors, isValid },
		handleSubmit,
	} = useForm<ParticipantFormData>({
		mode: "onChange",
		defaultValues: defaultValuesParticipant,
		resolver: yupResolver(yupParticipant),
	})

	useEffect(() => {
		if (loading || !data) return
		reset({
			name: data.name,
			lastNames: data.lastNames,
			gender: data.gender,
			identityNumber: data.identityNumber,
			signature: data.signature,
			notes: data.notes,
		})
	}, [loading, reset, data])

	const onSubmit = async (formData: ParticipantFormData) => {
		const ok = isEditForm
			? await updateSingleParticipant(participantId, formData)
			: await createSingleParticipant(permitId, formData)
		if (ok) {
			router.back()
		} else {
			Alert.alert("Error", "No se pudo guardar el participante")
		}
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
						const ok = await deleteSingleParticipant(participantId)
						if (ok) {
							router.back()
						} else {
							Alert.alert(
								"Error",
								"No se pudo eliminar el participante",
							)
						}
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
						error={errors.name?.message}
					>
						<Controller
							control={control}
							name="name"
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<TextInput
									mode="outlined"
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									autoCapitalize="words"
									error={!!errors.name}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Apellidos"
						labelPrefix="2"
						error={errors.lastNames?.message}
					>
						<Controller
							control={control}
							name="lastNames"
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<TextInput
									mode="outlined"
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									autoCapitalize="words"
									error={!!errors.lastNames}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Género"
						labelPrefix="3"
						error={errors.gender?.message}
					>
						<Controller
							control={control}
							name="gender"
							render={({ field: { onChange, value } }) => (
								<ToggleButtonGroup
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
						error={errors.identityNumber?.message}
					>
						<Controller
							control={control}
							name="identityNumber"
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<TextInput
									mode="outlined"
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									keyboardType="numeric"
									error={!!errors.identityNumber}
								/>
							)}
						/>
					</LabeledInput>

					<LabeledInput
						label="Firma"
						labelPrefix="5"
						error={errors.signature?.message}
					>
						<Controller
							control={control}
							name="signature"
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
						error={errors.notes?.message}
					>
						<Controller
							control={control}
							name="notes"
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<TextInput
									mode="outlined"
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									autoCapitalize="sentences"
									multiline
									style={{ height: 100 }}
									contentStyle={{
										height: 115,
										textAlignVertical: "top",
									}}
									error={!!errors.notes}
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
							disabled={!isValid || saving || deleting}
							style={{ flex: 1 }}
							loading={saving}
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
							disabled={saving || deleting}
							style={{
								flex: 1,
								backgroundColor: theme.colors.custom.crimson,
								marginTop: 16,
							}}
							textColor={theme.colors.onError}
							loading={deleting}
						>
							Borrar
						</Button>
					)}
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}
