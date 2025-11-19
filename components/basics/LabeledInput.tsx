import { Text, View } from "react-native"

type LabeledInputProps = {
	label: string
	labelPrefix?: string
	labelSuffix?: string
	error?: string
	children: React.ReactNode
}

export function LabeledInput({
	label,
	labelPrefix,
	labelSuffix,
	error,
	children,
}: LabeledInputProps) {
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
							backgroundColor: error ? "red" : "blue",
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
					style={{ flex: 1, textAlign: "left", fontWeight: "bold" }}
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
			{children}
			{error && (
				<Text style={{ color: "red", marginTop: 4 }}>{error}</Text>
			)}
		</View>
	)
}
