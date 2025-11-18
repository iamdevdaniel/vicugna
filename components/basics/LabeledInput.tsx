import { InputSelector, type RadioOption } from "@components"
import { type FieldValues, type Path, useFormContext } from "react-hook-form"
import { Text, View } from "react-native"

type LabeledInputProps<T extends FieldValues> = {
	name: Path<T>
	label: string
	type: "text" | "number" | "boolean" | "radio"
	labelSuffix?: string
	labelPrefix?: string
	options?: RadioOption[]
}

export function LabeledInput<T extends FieldValues>({
	name,
	label,
	labelPrefix,
	labelSuffix,
	type,
	options,
}: LabeledInputProps<T>) {
	const {
		control,
		formState: { errors },
	} = useFormContext<T>()

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
					{String(errors[name]?.message)}
				</Text>
			)}
		</View>
	)
}
