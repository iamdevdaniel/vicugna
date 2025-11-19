import regionales from "@assets/data/regionales.json"
import { SimpleDropdown as Dropdown, LabeledInput } from "@components"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { View } from "react-native"

type FormData = {
	departamento: string
	regional: string
	comunidad: string
}

export default function IndexForm11() {
	const {
		control,
		watch,
		setValue,
		formState: { errors },
	} = useForm<FormData>({
		defaultValues: { departamento: "", regional: "", comunidad: "" },
	})

	const [regionalOptions, setRegionalOptions] = useState<
		Array<{ label: string; value: string }>
	>([])
	const [comunidadOptions, setComunidadOptions] = useState<
		Array<{ label: string; value: string }>
	>([])

	const selectedDepartamento = watch("departamento")
	const selectedRegional = watch("regional")

	const departamentoOptions = Object.keys(regionales).map((key) => ({
		label: key,
		value: key,
	}))

	useEffect(() => {
		if (selectedDepartamento) {
			const dept =
				regionales[selectedDepartamento as keyof typeof regionales]
			setRegionalOptions(
				dept.regionales.map((r) => ({ label: r.nombre, value: r.id })),
			)
			setValue("regional", "")
			setValue("comunidad", "")
		} else {
			setRegionalOptions([])
			setComunidadOptions([])
		}
	}, [selectedDepartamento, setValue])

	useEffect(() => {
		if (selectedRegional && selectedDepartamento) {
			const dept =
				regionales[selectedDepartamento as keyof typeof regionales]
			const regional = dept.regionales.find(
				(r) => r.id === selectedRegional,
			)
			if (regional) {
				setComunidadOptions(
					regional.comunidades.map((c) => ({
						label: c.nombre,
						value: c.id,
					})),
				)
			}
			setValue("comunidad", "")
		} else {
			setComunidadOptions([])
		}
	}, [selectedRegional, selectedDepartamento, setValue])

	return (
		<View style={{ flex: 1, padding: 20 }}>
			<LabeledInput
				label="Departamento"
				labelPrefix="1"
				error={errors.departamento?.message}
			>
				<Controller
					control={control}
					name="departamento"
					render={({ field: { onChange, value } }) => (
						<Dropdown
							placeholder="Seleccionar departamento"
							options={departamentoOptions}
							value={value}
							onSelect={onChange}
						/>
					)}
				/>
			</LabeledInput>

			<LabeledInput
				label="Regional"
				labelPrefix="2"
				error={errors.regional?.message}
			>
				<Controller
					control={control}
					name="regional"
					render={({ field: { onChange, value } }) => (
						<Dropdown
							placeholder="Seleccionar regional"
							options={regionalOptions}
							value={value}
							onSelect={onChange}
							disabled={!selectedDepartamento}
						/>
					)}
				/>
			</LabeledInput>

			<LabeledInput
				label="Comunidad"
				labelPrefix="3"
				error={errors.comunidad?.message}
			>
				<Controller
					control={control}
					name="comunidad"
					render={({ field: { onChange, value } }) => (
						<Dropdown
							placeholder="Seleccionar comunidad"
							options={comunidadOptions}
							value={value}
							onSelect={onChange}
							disabled={!selectedRegional}
						/>
					)}
				/>
			</LabeledInput>
		</View>
	)
}
