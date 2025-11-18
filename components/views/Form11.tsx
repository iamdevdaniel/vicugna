import { InputSelector, type RadioOption } from "@components"
import { yupResolver } from "@hookform/resolvers/yup"
import type { Form11Data } from "@types"
import {
	FormProvider,
	type SubmitHandler,
	useForm,
	useFormContext,
} from "react-hook-form"
import { Pressable, ScrollView, Text, View } from "react-native"
import { defaultValues, schema } from "./Form11-utils"

type FormInputProps = {
	name: keyof Form11Data
	label: string
	type: "text" | "number" | "boolean" | "radio"
	labelSuffix?: string
	labelPrefix?: string
	options?: RadioOption[]
}

const FormInput: React.FC<FormInputProps> = ({
	name,
	label,
	labelPrefix,
	labelSuffix,
	type,
	options,
}) => {
	const {
		control,
		formState: { errors },
	} = useFormContext<Form11Data>()

	return (
		<View style={{ marginBottom: 16 }}>
			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: 4,
				}}
			>
				{labelPrefix && (
					<View
						style={{
							backgroundColor: errors[name] ? "red" : "blue",
							width: 24,
							height: 24,
							borderRadius: 12,
							justifyContent: "center",
							alignItems: "center",
							marginRight: 8,
						}}
					>
						<Text
							style={{
								color: "white",
								fontSize: 12,
								fontWeight: "bold",
							}}
						>
							{labelPrefix}
						</Text>
					</View>
				)}
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

			<InputSelector
				type={type}
				control={control}
				name={name}
				options={options}
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
}

export const Form11 = () => {
	const formMethods = useForm<Form11Data>({
		resolver: yupResolver(schema),
		defaultValues: defaultValues,
	})

	const onSubmit: SubmitHandler<Form11Data> = (data) => {
		console.log(data)
	}

	const clearErrorsAndForm = () => {
		formMethods.reset()
		console.log("Form reset!")
	}

	return (
		<FormProvider {...formMethods}>
			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
				keyboardShouldPersistTaps="handled"
			>
				<FormInput
					name="ficha"
					label="Nr. DE VELLÓN"
					type="text"
					labelPrefix="1"
					labelSuffix="FICHA"
				/>
				<FormInput
					name="pesoFibraBruto"
					label="PESO FIBRA EN BRUTO"
					type="number"
					labelPrefix="2"
					labelSuffix="GRAMOS"
				/>
				<FormInput
					name="pesoVellonLimpio"
					label="PESO VELLÓN LIMPIO"
					type="number"
					labelPrefix="3"
					labelSuffix="GRAMOS"
				/>
				<FormInput
					name="pesoBraga"
					label="PESO BRAGA"
					type="number"
					labelPrefix="4"
					labelSuffix="GRAMOS"
				/>
				<FormInput
					name="pesoTotalFibra"
					label="PESO TOTAL FIBRA"
					type="number"
					labelPrefix="5"
					labelSuffix="GRAMOS"
				/>
				<FormInput
					name="pesoFibraPredescerdada"
					label="PESO FIBRA PREDESCERDADA"
					type="number"
					labelPrefix="6"
					labelSuffix="GRAMOS"
				/>
				<FormInput
					name="pesoCerda"
					label="PESO CERDA"
					type="number"
					labelPrefix="7"
				/>
				<FormInput
					name="caspa"
					type="radio"
					label="TIENE CASPA"
					labelPrefix="8"
					options={[
						{ label: "SI", value: "SI" },
						{ label: "NO", value: "NO" },
					]}
				/>
				<FormInput
					name="nombrePredescerdador"
					label="NOMBRE DEL PREDESCERDADOR"
					type="text"
					labelPrefix="9"
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
						onPress={formMethods.handleSubmit(onSubmit)}
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
		</FormProvider>
	)
}
