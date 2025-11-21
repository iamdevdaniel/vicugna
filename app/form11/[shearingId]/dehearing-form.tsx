import { LabeledInput } from "@components"
import { yupResolver } from "@hookform/resolvers/yup"
import type { Form11Dehearing } from "@types"
import {
	defaultValuesForm11Dehearing,
	schemaForm11Dehearing,
} from "@utils/form11-schemas"
import { Controller, useForm } from "react-hook-form"
import { Pressable, ScrollView, Text, TextInput, View } from "react-native"

export default function DehearingForm() {
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<Form11Dehearing>({
		defaultValues: defaultValuesForm11Dehearing,
		resolver: yupResolver(schemaForm11Dehearing),
	})

	const onSubmit = (data: Form11Dehearing) => {
		console.log(data)
	}

	const clearForm = () => {
		reset()
		console.log("Form reset!")
	}

	return (
		<ScrollView
			style={{ flex: 1 }}
			contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
			keyboardShouldPersistTaps="handled"
		>
			<LabeledInput
				label="Fecha Inicio Predescerdado"
				labelPrefix="1"
				error={errors.fechaInicioPredescerdado?.message}
			>
				<Controller
					control={control}
					name="fechaInicioPredescerdado"
					render={({ field: { onChange, value } }) => (
						<TextInput
							placeholder="DD/MM/YYYY"
							value={value}
							onChangeText={onChange}
							style={{
								borderWidth: 1,
								borderColor: "#ccc",
								borderRadius: 4,
								padding: 12,
								backgroundColor: "#fff",
							}}
						/>
					)}
				/>
			</LabeledInput>

			<LabeledInput
				label="Fecha Fin Predescerdado"
				labelPrefix="2"
				error={errors.fechaFinPredescerdado?.message}
			>
				<Controller
					control={control}
					name="fechaFinPredescerdado"
					render={({ field: { onChange, value } }) => (
						<TextInput
							placeholder="DD/MM/YYYY"
							value={value}
							onChangeText={onChange}
							style={{
								borderWidth: 1,
								borderColor: "#ccc",
								borderRadius: 4,
								padding: 12,
								backgroundColor: "#fff",
							}}
						/>
					)}
				/>
			</LabeledInput>

			<LabeledInput
				label="Lugar Predescerdado"
				labelPrefix="3"
				error={errors.lugarPredescerdado?.message}
			>
				<Controller
					control={control}
					name="lugarPredescerdado"
					render={({ field: { onChange, value } }) => (
						<TextInput
							placeholder="Ingrese lugar"
							value={value}
							onChangeText={onChange}
							style={{
								borderWidth: 1,
								borderColor: "#ccc",
								borderRadius: 4,
								padding: 12,
								backgroundColor: "#fff",
							}}
						/>
					)}
				/>
			</LabeledInput>

			<LabeledInput
				label="Responsables Predescerdado"
				labelPrefix="4"
				error={errors.responsablesPredescerdado?.message}
			>
				<Controller
					control={control}
					name="responsablesPredescerdado"
					render={({ field: { onChange, value } }) => (
						<TextInput
							placeholder="Ingrese responsables"
							value={value}
							onChangeText={onChange}
							style={{
								borderWidth: 1,
								borderColor: "#ccc",
								borderRadius: 4,
								padding: 12,
								backgroundColor: "#fff",
							}}
						/>
					)}
				/>
			</LabeledInput>

			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
					marginTop: 24,
				}}
			>
				<Pressable
					style={{
						flex: 1,
						padding: 12,
						borderRadius: 6,
						alignItems: "center",
						marginHorizontal: 4,
						backgroundColor: "#007AFF",
					}}
					onPress={handleSubmit(onSubmit)}
				>
					<Text style={{ color: "#fff", fontWeight: "bold" }}>
						GUARDAR
					</Text>
				</Pressable>
				<Pressable
					style={{
						flex: 1,
						padding: 12,
						borderRadius: 6,
						alignItems: "center",
						marginHorizontal: 4,
						backgroundColor: "#888",
					}}
					onPress={clearForm}
				>
					<Text style={{ color: "#fff", fontWeight: "bold" }}>
						LIMPIAR
					</Text>
				</Pressable>
			</View>
		</ScrollView>
	)
}
