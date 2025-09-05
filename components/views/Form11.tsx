import { yupResolver } from "@hookform/resolvers/yup"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import { Pressable, ScrollView, Text, View } from "react-native"
import { TextInput } from "react-native-paper"
import { schema } from "./Form11-utils"
import { type Form11Data } from '@types'

export const Form11 = () => {
	const {
		reset,
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<Form11Data>({
		resolver: yupResolver(schema),
	})

	const onSubmit: SubmitHandler<Form11Data> = (data) => {
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
		name: keyof Form11Data
		label: string
		labelSuffix?: string
		keyboardType?: "default" | "numeric"
	}) => (
		<View style={{ marginBottom: 16 }}>
			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: 4,
				}}
			>
				<Text
					style={{
						flex: 1,
						textAlign: "left",
						fontWeight: "bold",
					}}
				>
					{label}
				</Text>
				{labelSuffix && (
					<Text
						style={{
							textAlign: "right",
							color: "#888",
							marginLeft: 8,
						}}
					>
						{labelSuffix}
					</Text>
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
						style={{
							borderWidth: 1,
							borderColor: "#ccc",
							paddingHorizontal: 8,
						}}
					/>
				)}
			/>
			{errors[name] && (
				<Text
					style={{
						color: "red",
						marginTop: 4,
					}}
				>
					{errors[name].message}
				</Text>
			)}
		</View>
	)

	return (
		<ScrollView
			style={{ flex: 1 }}
			contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
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
				labelSuffix=""
			/>
			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
					marginTop: 24,
					marginBottom: 24,
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
					<Text
						style={{
							color: "#fff",
							fontWeight: "bold",
						}}
					>
						Guardar
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
					onPress={clearErrorsAndForm}
				>
					<Text
						style={{
							color: "#fff",
							fontWeight: "bold",
						}}
					>
						Limpiar
					</Text>
				</Pressable>
			</View>
		</ScrollView>
	)
}
