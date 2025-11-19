import { LabeledInput, RadioGroup } from "@components"
import { yupResolver } from "@hookform/resolvers/yup"
import type { Form11Body } from "@types"
import {
	Controller,
	FormProvider,
	type SubmitHandler,
	useForm,
} from "react-hook-form"
import { Pressable, ScrollView, Text, View } from "react-native"
import { TextInput } from "react-native-paper"

import {
	defaultValuesForm11Body as defaultValues,
	schemaForm11Body as schema,
} from "./utils"

export default function NewRegistry() {
	const formMethods = useForm<Form11Body>({
		resolver: yupResolver(schema),
		defaultValues: defaultValues,
	})

	const {
		control,
		formState: { errors },
	} = formMethods

	const onSubmit: SubmitHandler<Form11Body> = (data) => {
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
					label="Nr. DE VELLÓN"
					labelPrefix="1"
					labelSuffix="FICHA"
					error={errors.ficha?.message}
				>
					<Controller
						control={control}
						name="ficha"
						render={({ field }) => (
							<TextInput
								value={field.value}
								onChangeText={field.onChange}
							/>
						)}
					/>
				</LabeledInput>
				<LabeledInput
					label="PESO FIBRA EN BRUTO"
					labelPrefix="2"
					labelSuffix="GRAMOS"
					error={errors.pesoFibraBruto?.message}
				>
					<Controller
						control={control}
						name="pesoFibraBruto"
						render={({ field }) => (
							<TextInput
								value={field.value}
								onChangeText={field.onChange}
								keyboardType="numeric"
							/>
						)}
					/>
				</LabeledInput>
				<LabeledInput
					label="PESO VELLÓN LIMPIO"
					labelPrefix="3"
					labelSuffix="GRAMOS"
					error={errors.pesoVellonLimpio?.message}
				>
					<Controller
						control={control}
						name="pesoVellonLimpio"
						render={({ field }) => (
							<TextInput
								value={field.value}
								onChangeText={field.onChange}
								keyboardType="numeric"
							/>
						)}
					/>
				</LabeledInput>
				<LabeledInput
					label="PESO BRAGA"
					labelPrefix="4"
					labelSuffix="GRAMOS"
					error={errors.pesoBraga?.message}
				>
					<Controller
						control={control}
						name="pesoBraga"
						render={({ field }) => (
							<TextInput
								value={field.value}
								onChangeText={field.onChange}
								keyboardType="numeric"
							/>
						)}
					/>
				</LabeledInput>
				<LabeledInput
					label="PESO TOTAL FIBRA"
					labelPrefix="5"
					labelSuffix="GRAMOS"
					error={errors.pesoTotalFibra?.message}
				>
					<Controller
						control={control}
						name="pesoTotalFibra"
						render={({ field }) => (
							<TextInput
								value={field.value}
								onChangeText={field.onChange}
								keyboardType="numeric"
							/>
						)}
					/>
				</LabeledInput>
				<LabeledInput
					label="PESO FIBRA PREDESCERDADA"
					labelPrefix="6"
					labelSuffix="GRAMOS"
					error={errors.pesoFibraPredescerdada?.message}
				>
					<Controller
						control={control}
						name="pesoFibraPredescerdada"
						render={({ field }) => (
							<TextInput
								value={field.value}
								onChangeText={field.onChange}
								keyboardType="numeric"
							/>
						)}
					/>
				</LabeledInput>
				<LabeledInput
					label="PESO CERDA"
					labelPrefix="7"
					error={errors.pesoCerda?.message}
				>
					<Controller
						control={control}
						name="pesoCerda"
						render={({ field }) => (
							<TextInput
								value={field.value}
								onChangeText={field.onChange}
								keyboardType="numeric"
							/>
						)}
					/>
				</LabeledInput>
				<LabeledInput
					label="TIENE CASPA"
					labelPrefix="8"
					error={errors.caspa?.message}
				>
					<Controller
						control={control}
						name="caspa"
						render={({ field }) => (
							<RadioGroup
								value={field.value}
								onChange={field.onChange}
								options={[
									{ label: "SI", value: "SI" },
									{ label: "NO", value: "NO" },
								]}
							/>
						)}
					/>
				</LabeledInput>
				<LabeledInput
					label="NOMBRE DEL PREDESCERDADOR"
					labelPrefix="9"
					error={errors.nombrePredescerdador?.message}
				>
					<Controller
						control={control}
						name="nombrePredescerdador"
						render={({ field }) => (
							<TextInput
								value={field.value}
								onChangeText={field.onChange}
							/>
						)}
					/>
				</LabeledInput>
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
