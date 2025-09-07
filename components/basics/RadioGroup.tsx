import type React from "react"
import { View } from "react-native"
import { RadioButton, type RadioButtonGroupProps } from "react-native-paper"

export type RadioOption = { label: string; value: string }

export type RadioGroupProps = Omit<
	RadioButtonGroupProps,
	"onValueChange" | "children"
> & {
	value: string
	onChange: (value: string) => void
	options: RadioOption[]
	label?: string
	horizontal?: boolean
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
	value,
	onChange,
	options,
	horizontal = true,
	...groupProps
}) => (
	<View style={{ marginBottom: 16 }}>
		<RadioButton.Group
			onValueChange={onChange}
			value={value}
			{...groupProps}
		>
			<View
				style={{
					flexDirection: horizontal ? "row" : "column",
					alignItems: "center",
				}}
			>
				{options.map((opt) => (
					<RadioButton.Item
						key={opt.value}
						label={opt.label}
						value={opt.value}
						style={horizontal ? { marginRight: 8 } : undefined}
					/>
				))}
			</View>
		</RadioButton.Group>
	</View>
)
