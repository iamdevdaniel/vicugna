import { InputSelector } from "@components"
import { yupResolver } from "@hookform/resolvers/yup"
import type { Form11Data } from "@types"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import { Pressable, ScrollView, Text, View } from "react-native"
import { defaultValues, schema } from "./Form11-utils"

type FormInputProps = {
	name: keyof Form11Data
	label: string
	type: "text" | "number" | "boolean"
	labelSuffix?: string
}

export const Form11 = () => {
	const {
		reset,
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<Form11Data>({
		resolver: yupResolver(schema),
		defaultValues: defaultValues,
	})

	const onSubmit: SubmitHandler<Form11Data> = (data) => {
		console.log(data)
	}

	const clearErrorsAndForm = () => {
		reset()
		console.log("Form reset!")
	}

	const FormInput: React.FC<FormInputProps> = ({
		name,
		label,
		labelSuffix,
		type,
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
					<InputSelector
						type={type}
						value={value}
						onChange={onChange}
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
			<FormInput
				name="ficha"
				label="Nr. DE VELLÓN"
				type="text"
				labelSuffix="FICHA"
			/>
			<FormInput
				name="pesoFibraBruto"
				label="PESO FIBRA EN BRUTO"
				type="number"
				labelSuffix="GRAMOS"
			/>
			<FormInput
				name="pesoVellonLimpio"
				label="PESO VELLÓN LIMPIO"
				type="number"
				labelSuffix="GRAMOS"
			/>
			<FormInput
				name="pesoBraga"
				label="PESO BRAGA"
				type="number"
				labelSuffix="GRAMOS"
			/>
			<FormInput
				name="pesoTotalFibra"
				label="PESO TOTAL FIBRA"
				type="number"
				labelSuffix="GRAMOS"
			/>
			<FormInput
				name="pesoFibraPredescerdada"
				label="PESO FIBRA PREDESCERDADA"
				type="number"
				labelSuffix="GRAMOS"
			/>
			<FormInput
				name="pesoCerda"
				label="PESO CERDA"
				type="number"
				labelSuffix="GRAMOS"
			/>
			<FormInput name="caspa" label="PRESENCIA DE CASPA" type="boolean" />
			<FormInput
				name="nombrePredescerdador"
				label="NOMBRE DEL PREDESCERDADOR"
				type="text"
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
