import { useAppTheme } from "@utils/useAppTheme"
import { Text, View } from "react-native"

type LabeledInputProps = {
	label: string
	labelPrefix?: string
	labelSuffix?: string
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
							backgroundColor: error
								? theme.colors.custom.crimson
								: disabled
									? theme.colors.outlineVariant
									: theme.colors.custom.blue,
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
								color: theme.colors.onPrimary,
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
						fontWeight: disabled ? "500" : "bold",
						color: disabled
							? theme.colors.onSurfaceVariant
							: theme.colors.onSurface,
					}}
				>
					{label}
				</Text>
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
