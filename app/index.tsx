import { yupResolver } from "@hookform/resolvers/yup"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import {
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native"
import * as yup from "yup"

type WoolFormData = {
	ficha: string
	pesoFibraBruto: number
	pesoVellonLimpio: number
	pesoBraga: number
	pesoTotalFibra: number
	pesoFibraPredescerdada: number
	pesoCerda: number
	caspa: string
	nombrePredescerdador: string
}

const schema = yup.object().shape({
	ficha: yup.string().required("Requerido"),
	pesoFibraBruto: yup
		.number()
		.typeError("Debe ser un número")
		.positive("Debe ser positivo")
		.test("decimals", "Máximo 2 decimales", (val) =>
			/^\d+(\.\d{1,2})?$/.test(String(val)),
		)
		.required("Requerido"),
	pesoVellonLimpio: yup
		.number()
		.typeError("Debe ser un número")
		.positive("Debe ser positivo")
		.test("decimals", "Máximo 2 decimales", (val) =>
			/^\d+(\.\d{1,2})?$/.test(String(val)),
		)
		.required("Requerido"),
	pesoBraga: yup
		.number()
		.typeError("Debe ser un número")
		.positive("Debe ser positivo")
		.test("decimals", "Máximo 2 decimales", (val) =>
			/^\d+(\.\d{1,2})?$/.test(String(val)),
		)
		.required("Requerido"),
	pesoTotalFibra: yup
		.number()
		.typeError("Debe ser un número")
		.positive("Debe ser positivo")
		.test("decimals", "Máximo 2 decimales", (val) =>
			/^\d+(\.\d{1,2})?$/.test(String(val)),
		)
		.required("Requerido"),
	pesoFibraPredescerdada: yup
		.number()
		.typeError("Debe ser un número")
		.positive("Debe ser positivo")
		.test("decimals", "Máximo 2 decimales", (val) =>
			/^\d+(\.\d{1,2})?$/.test(String(val)),
		)
		.required("Requerido"),
	pesoCerda: yup
		.number()
		.typeError("Debe ser un número")
		.positive("Debe ser positivo")
		.test("decimals", "Máximo 2 decimales", (val) =>
			/^\d+(\.\d{1,2})?$/.test(String(val)),
		)
		.required("Requerido"),
	caspa: yup.string().required("Requerido"),
	nombrePredescerdador: yup.string().required("Requerido"),
})

export default function WoolForm() {
	const {
		reset,
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<WoolFormData>({
		resolver: yupResolver(schema),
	})

	const onSubmit: SubmitHandler<WoolFormData> = (data) => {
		// Save data locally
		console.log(data)
	}

	const clearErrorsAndForm = () => {
		reset()
		console.log("Form reset!")
	}

	const renderInput = (
		name: keyof WoolFormData,
		label: string,
		keyboardType: "default" | "numeric" = "default",
	) => (
		<Controller
			control={control}
			name={name}
			render={({ field: { onChange, value } }) => (
				<>
					<Text>{label}</Text>
					<TextInput
						value={value ? String(value) : ""}
						onChangeText={onChange}
						keyboardType={keyboardType}
						style={styles.input}
					/>
					{errors[name] && (
						<Text style={styles.error}>
							{errors[name]?.message}
						</Text>
					)}
				</>
			)}
		/>
	)

	return (
		<ScrollView
			style={styles.scroll}
			contentContainerStyle={styles.container}
			keyboardShouldPersistTaps="handled"
		>
			{renderInput("ficha", "Nr. DE VELLÓN (FICHA)")}
			{renderInput(
				"pesoFibraBruto",
				"PESO FIBRA EN BRUTO (Gramos)",
				"numeric",
			)}
			{renderInput(
				"pesoVellonLimpio",
				"PESO VELLÓN LIMPIO (Gramos)",
				"numeric",
			)}
			{renderInput("pesoBraga", "PESO BRAGA (Gramos)", "numeric")}
			{renderInput(
				"pesoTotalFibra",
				"PESO TOTAL FIBRA (Gramos)",
				"numeric",
			)}
			{renderInput(
				"pesoFibraPredescerdada",
				"PESO FIBRA PREDESCERDADA (Gramos)",
				"numeric",
			)}
			{renderInput("pesoCerda", "PESO CERDA (Gramos)", "numeric")}
			{renderInput("caspa", "PRESENCIA DE CASPA")}
			{renderInput(
				"nombrePredescerdador",
				"NOMBRE DEL PREDESCERDADOR (A)",
			)}
			<View style={styles.buttonRow}>
				<Pressable
					style={[styles.pressable, styles.save]}
					onPress={handleSubmit(onSubmit)}
				>
					<Text style={styles.pressableText}>Guardar</Text>
				</Pressable>
				<Pressable
					style={[styles.pressable, styles.clear]}
					onPress={clearErrorsAndForm}
				>
					<Text style={styles.pressableText}>Limpiar</Text>
				</Pressable>
			</View>
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	scroll: {
		flex: 1,
	},
	container: {
		padding: 20,
		paddingBottom: 40,
	},
	inputGroup: {
		marginBottom: 16,
	},
	label: {
		marginBottom: 4,
		fontWeight: "bold",
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		padding: 8,
		borderRadius: 4,
	},
	error: {
		color: "red",
		marginTop: 4,
	},
	buttonContainer: {
		marginTop: 24,
		marginBottom: 24,
	},
	buttonRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 24,
		marginBottom: 24,
	},
	pressable: {
		flex: 1,
		padding: 12,
		borderRadius: 6,
		alignItems: "center",
		marginHorizontal: 4,
	},
	save: {
		backgroundColor: "#007AFF",
	},
	clear: {
		backgroundColor: "#888",
	},
	pressableText: {
		color: "#fff",
		fontWeight: "bold",
	},
})
