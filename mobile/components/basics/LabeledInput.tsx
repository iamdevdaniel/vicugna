import { useAppTheme } from "@utils/useAppTheme"
import { Text, View } from "react-native"

type LabeledInputProps = {
	label: React.ReactNode
	labelPrefix?: React.ReactNode
	labelSuffix?: React.ReactNode
	error?: string
	disabled?: boolean
	children: React.ReactNode
}

export function LabeledInput({
	label,
	labelPrefix,
	labelSuffix,
	error,
	disabled = false,
	children,
}: LabeledInputProps) {
	const theme = useAppTheme()

	return (
		<View style={{ marginBottom: 32 }}>
			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: 4,
				}}
			>
				{labelPrefix && (
					<Text
						style={{
							width: 24,
							color: disabled
								? theme.colors.onSurfaceVariant
								: theme.colors.onSurface,
						}}
					>
						{labelPrefix}.
					</Text>
				)}
				<View
					style={{
						flex: 1,
						flexDirection: "row",
						alignItems: "center",
						gap: 6,
					}}
				>
					<Text
						style={{
							textAlign: "left",
							fontWeight: disabled ? "500" : "bold",
							color: disabled
								? theme.colors.onSurfaceVariant
								: theme.colors.onSurface,
						}}
					>
						{label}
					</Text>
				</View>
				{labelSuffix && (
					<Text
						style={{
							textAlign: "right",
							color: disabled
								? theme.colors.outline
								: theme.colors.onSurfaceVariant,
							marginLeft: 8,
						}}
					>
						{labelSuffix}
					</Text>
				)}
			</View>
			{children}
			{error && (
				<Text
					style={{ color: theme.colors.custom.crimson, marginTop: 2 }}
				>
					{error}
				</Text>
			)}
		</View>
	)
}
