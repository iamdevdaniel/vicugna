import { MaterialIcons } from "@expo/vector-icons"
import type React from "react"
import { useState } from "react"
import {
	FlatList,
	Modal,
	Pressable,
	type StyleProp,
	StyleSheet,
	Text,
	View,
	type ViewStyle,
} from "react-native"

type Option = {
	label: string
	value: string
}

type SimpleDropdownProps = {
	label?: string
	placeholder?: string
	options: Option[]
	value: string
	onSelect: (value: string) => void
	disabled?: boolean
	style?: StyleProp<ViewStyle>
}

export const SimpleDropdown: React.FC<SimpleDropdownProps> = ({
	label,
	placeholder = "Seleccionar...",
	options,
	value,
	onSelect,
	disabled = false,
	style,
}) => {
	const [isVisible, setIsVisible] = useState(false)

	const selectedOption = options.find((opt) => opt.value === value)
	const displayText = selectedOption ? selectedOption.label : placeholder

	const handleSelect = (optionValue: string) => {
		onSelect(optionValue)
		setIsVisible(false)
	}

	return (
		<View style={[styles.container, style]}>
			{label && <Text style={styles.label}>{label}</Text>}

			<Pressable
				style={[styles.trigger, disabled && styles.disabled]}
				onPress={() => !disabled && setIsVisible(true)}
				disabled={disabled}
			>
				<Text
					style={[
						styles.triggerText,
						!selectedOption && styles.placeholder,
						disabled && styles.disabledText,
					]}
				>
					{displayText}
				</Text>
				<MaterialIcons
					name="keyboard-arrow-down"
					size={24}
					color={disabled ? "#999" : "#666"}
				/>
			</Pressable>

			<Modal
				visible={isVisible}
				transparent
				animationType="fade"
				onRequestClose={() => setIsVisible(false)}
			>
				<Pressable
					style={styles.overlay}
					onPress={() => setIsVisible(false)}
				>
					<View style={styles.dropdown}>
						<FlatList
							data={options}
							keyExtractor={(item) => item.value}
							renderItem={({ item }) => (
								<Pressable
									style={styles.option}
									onPress={() => handleSelect(item.value)}
								>
									<Text style={styles.optionText}>
										{item.label}
									</Text>
								</Pressable>
							)}
							style={styles.optionsList}
						/>
					</View>
				</Pressable>
			</Modal>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 2,
	},
	label: {
		fontSize: 16,
		fontWeight: "500",
		marginBottom: 8,
		color: "#333",
	},
	trigger: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 4,
		padding: 12,
		backgroundColor: "#fff",
	},
	disabled: {
		backgroundColor: "#f5f5f5",
		borderColor: "#ddd",
	},
	triggerText: {
		fontSize: 16,
		color: "#333",
		flex: 1,
	},
	placeholder: {
		color: "#999",
	},
	disabledText: {
		color: "#999",
	},
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	dropdown: {
		backgroundColor: "#fff",
		borderRadius: 4,
		maxHeight: 300,
		width: "80%",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	optionsList: {
		maxHeight: 300,
	},
	option: {
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	optionText: {
		fontSize: 16,
		color: "#333",
	},
})
