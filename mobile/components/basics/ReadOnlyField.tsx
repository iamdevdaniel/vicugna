import { useAppTheme } from "@utils/useAppTheme"
import { StyleSheet, Text, View } from "react-native"
import { SignaturePreview } from "./SignaturePad"

type ReadOnlyFieldProps = {
	label: string
	labelPrefix: string
	value: string
	valueType?: "text" | "signature"
	labelSuffix?: string
}

export function ReadOnlyField({
	label,
	labelPrefix,
	value,
	valueType = "text",
	labelSuffix,
}: ReadOnlyFieldProps) {
	const theme = useAppTheme()
	const displayValue = value.trim() || "-"

	return (
		<View
			style={[
				styles.container,
				{ borderBottomColor: theme.colors.outlineVariant },
			]}
		>
			<View style={styles.keyColumn}>
				<Text style={[styles.prefix, { color: theme.colors.primary }]}>
					{labelPrefix}
				</Text>
				<Text
					style={[
						styles.label,
						{ color: theme.colors.onSurfaceVariant },
					]}
				>
					{label}
				</Text>
			</View>
			<View style={styles.valueContainer}>
				{valueType === "signature" && displayValue !== "-" ? (
					<SignaturePreview value={value} />
				) : (
					<Text
						style={[
							styles.value,
							{ color: theme.colors.onSurface },
						]}
					>
						{displayValue}
						{labelSuffix && displayValue !== "-"
							? ` ${labelSuffix}`
							: ""}
					</Text>
				)}
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		minHeight: 44,
		flexDirection: "row",
		alignItems: "flex-start",
		paddingVertical: 10,
		borderBottomWidth: 1,
	},
	keyColumn: {
		width: 145,
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 8,
	},
	prefix: {
		width: 24,
		fontSize: 12,
		fontWeight: "700",
		textAlign: "center",
	},
	label: {
		flex: 1,
		fontSize: 13,
		fontWeight: "600",
	},
	valueContainer: {
		flex: 1,
		marginLeft: 12,
	},
	value: {
		fontSize: 15,
		fontWeight: "500",
		lineHeight: 20,
	},
})
