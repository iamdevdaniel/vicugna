import {
	defaultValuesForm11 as defaultValues,
	LabeledInput,
	schemaForm11 as schema,
} from "@components"
import { yupResolver } from "@hookform/resolvers/yup"
import type { Form11Data } from "@types"
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form"
import { Pressable, ScrollView, Text, View } from "react-native"

export default function Form11() {
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
				<LabeledInput
					name="ficha"
					label="Nr. DE VELLÓN"
					type="text"
					labelPrefix="1"
					labelSuffix="FICHA"
				/>
				<LabeledInput
					name="pesoFibraBruto"
					label="PESO FIBRA EN BRUTO"
					type="number"
					labelPrefix="2"
					labelSuffix="GRAMOS"
				/>
				<LabeledInput
					name="pesoVellonLimpio"
					label="PESO VELLÓN LIMPIO"
					type="number"
					labelPrefix="3"
					labelSuffix="GRAMOS"
				/>
				<LabeledInput
					name="pesoBraga"
					label="PESO BRAGA"
					type="number"
					labelPrefix="4"
					labelSuffix="GRAMOS"
				/>
				<LabeledInput
					name="pesoTotalFibra"
					label="PESO TOTAL FIBRA"
					type="number"
					labelPrefix="5"
					labelSuffix="GRAMOS"
				/>
				<LabeledInput
					name="pesoFibraPredescerdada"
					label="PESO FIBRA PREDESCERDADA"
					type="number"
					labelPrefix="6"
					labelSuffix="GRAMOS"
				/>
				<LabeledInput
					name="pesoCerda"
					label="PESO CERDA"
					type="number"
					labelPrefix="7"
				/>
				<LabeledInput
					name="caspa"
					type="radio"
					label="TIENE CASPA"
					labelPrefix="8"
					options={[
						{ label: "SI", value: "SI" },
						{ label: "NO", value: "NO" },
					]}
				/>
				<LabeledInput
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
						onPress={clearErrorsAndForm}
					>
						<Text
							style={{
								color: "#fff",
								fontWeight: "bold",
							}}
						>
							LIMPIAR
						</Text>
					</Pressable>
				</View>
			</ScrollView>
		</FormProvider>
	)
}
