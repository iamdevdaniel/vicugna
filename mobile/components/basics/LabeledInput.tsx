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
									? theme.colors.custom.darkGray
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
								color: disabled
									? theme.colors.custom.white
									: theme.colors.onPrimary,
								fontSize: 12,
								fontWeight: "bold",
							}}
						>
							{labelPrefix}
						</Text>
					</View>
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
