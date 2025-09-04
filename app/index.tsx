import { yupResolver } from "@hookform/resolvers/yup"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import {
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	// TextInput,
	View,
} from "react-native"
import { TextInput } from "react-native-paper"
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

	const FormInput = ({
		name,
		label,
		labelSuffix,
		keyboardType = "default",
	}: {
		name: keyof WoolFormData
		label: string
		labelSuffix?: string
		keyboardType?: "default" | "numeric"
	}) => (
		<View style={{ marginBottom: 16 }}>
			<View style={styles.labelRow}>
				<Text style={styles.label}>{label}</Text>
				{labelSuffix && (
					<Text style={styles.labelSuffix}>{labelSuffix}</Text>
				)}
			</View>
			<Controller
				control={control}
				name={name}
				render={({ field: { onChange, value } }) => (
					<TextInput
						value={value ? String(value) : ""}
						onChangeText={onChange}
						keyboardType={keyboardType}
						style={styles.input}
					/>
				)}
			/>
			{errors[name] && (
				<Text style={styles.error}>{errors[name].message}</Text>
			)}
		</View>
	)

	return (
		<ScrollView
			style={styles.scroll}
			contentContainerStyle={styles.container}
			keyboardShouldPersistTaps="handled"
		>
			<FormInput name="ficha" label="Nr. DE VELLÓN" labelSuffix="FICHA" />
			<FormInput
				name="pesoFibraBruto"
				label="PESO FIBRA EN BRUTO"
				labelSuffix="GRAMOS"
				keyboardType="numeric"
			/>
			<FormInput
				name="pesoVellonLimpio"
				label="PESO VELLÓN LIMPIO"
				labelSuffix="GRAMOS"
				keyboardType="numeric"
			/>
			<FormInput
				name="pesoBraga"
				label="PESO BRAGA"
				labelSuffix="GRAMOS"
				keyboardType="numeric"
			/>
			<FormInput
				name="pesoTotalFibra"
				label="PESO TOTAL FIBRA"
				labelSuffix="GRAMOS"
				keyboardType="numeric"
			/>
			<FormInput
				name="pesoFibraPredescerdada"
				label="PESO FIBRA PREDESCERDADA"
				labelSuffix="GRAMOS"
				keyboardType="numeric"
			/>
			<FormInput
				name="pesoCerda"
				label="PESO CERDA"
				labelSuffix="GRAMOS"
				keyboardType="numeric"
			/>
			<FormInput name="caspa" label="PRESENCIA DE CASPA" />
			<FormInput
				name="nombrePredescerdador"
				label="NOMBRE DEL PREDESCERDADOR"
				labelSuffix="(A)"
			/>
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
	labelRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 4,
	},
	label: {
		flex: 1,
		textAlign: "left",
		fontWeight: "bold",
	},
	labelSuffix: {
		textAlign: "right",
		color: "#888",
		marginLeft: 8,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		paddingHorizontal: 8,
		// borderRadius: 8,
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
