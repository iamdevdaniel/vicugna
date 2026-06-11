import { useAppTheme } from "@utils/useAppTheme"
import { Text, View } from "react-native"
import { IconButton } from "react-native-paper"

type CleaningCommonSummaryProps = {
	fleeceNumber?: string
	grossWeight?: number
	onEdit: () => void
}

export function CleaningCommonSummary({
	fleeceNumber,
	grossWeight,
	onEdit,
}: CleaningCommonSummaryProps) {
	const theme = useAppTheme()

	return (
		<View
			style={{
				paddingVertical: 10,
				borderBottomWidth: 1,
				borderBottomColor: theme.colors.outlineVariant,
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
							color: theme.colors.onSurfaceVariant,
							fontSize: 12,
						}}
					>
						Vellon
					</Text>
					<Text
						style={{
							color: theme.colors.onSurface,
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
							color: theme.colors.onSurfaceVariant,
							fontSize: 12,
						}}
					>
						Peso bruto
					</Text>
					<Text
						style={{
							color: theme.colors.onSurface,
							fontSize: 18,
							fontWeight: "700",
						}}
					>
						{grossWeight} gramos
					</Text>
				</View>

				<IconButton
					icon="pencil"
					mode="outlined"
					size={18}
					onPress={onEdit}
				/>
			</View>
		</View>
	)
}
