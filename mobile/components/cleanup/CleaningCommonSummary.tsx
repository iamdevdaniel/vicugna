import { useAppTheme } from "@utils/useAppTheme"
import { Text, View } from "react-native"
import { IconButton } from "react-native-paper"

type CleaningCommonSummaryProps = {
	fleeceNumber?: string
	grossWeight?: number
	onEdit?: () => void
	disabled?: boolean
}

export function CleaningCommonSummary({
	fleeceNumber,
	grossWeight,
	onEdit,
	disabled = false,
}: CleaningCommonSummaryProps) {
	const theme = useAppTheme()
	const labelColor = disabled
		? theme.colors.onSurfaceDisabled
		: theme.colors.onSurfaceVariant
	const valueColor = disabled
		? theme.colors.onSurfaceDisabled
		: theme.colors.onSurface

	return (
		<View
			style={{
				paddingVertical: 10,
				gap: 6,
			}}
		>
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<View style={{ flex: 1 }}>
					<Text
						style={{
							color: labelColor,
							fontSize: 12,
						}}
					>
						Nro de vellon
					</Text>
					<Text
						style={{
							color: valueColor,
							fontSize: 18,
							fontWeight: "700",
						}}
					>
						{fleeceNumber}
					</Text>
				</View>

				<View style={{ flex: 1 }}>
					<Text
						style={{
							color: labelColor,
							fontSize: 12,
						}}
					>
						Peso bruto
					</Text>
					<Text
						style={{
							color: valueColor,
							fontSize: 18,
							fontWeight: "700",
						}}
					>
						{grossWeight} gramos
					</Text>
				</View>

				<IconButton
					icon="chevron-right"
					mode="outlined"
					size={18}
					disabled={!onEdit}
					onPress={onEdit}
				/>
			</View>
		</View>
	)
}
