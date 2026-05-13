import { useAppTheme } from "@utils/useAppTheme"
import { Pressable, Text, View } from "react-native"
import { Button, IconButton } from "react-native-paper"

export const OverviewStep = ({
	number,
	title,
	onPress,
	state = "ready",
	details,
	actionLabel = "LLENAR",
}: {
	number: number
	title: string
	onPress: () => void
	state?: "ready" | "done" | "disabled"
	details?: Array<{ label: string; value: string }>
	actionLabel?: string
}) => {
	const theme = useAppTheme()
	const disabled = state === "disabled"
	const done = state === "done"
	return (
		<Pressable
			onPress={disabled ? undefined : onPress}
			style={{
				flexDirection: "column",
				backgroundColor: theme.colors.surface,
				padding: 16,
				borderRadius: 12,
				marginBottom: 12,
				borderWidth: 1,
				borderColor: theme.colors.outlineVariant,
				opacity: disabled ? 0.4 : 1,
			}}
		>
			{/* Header row: number badge + title */}
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					marginBottom: done && details && details.length > 0 ? 8 : 0,
				}}
			>
				<View
					style={{
						backgroundColor: done
							? theme.colors.custom.green
							: disabled
								? theme.colors.onSurfaceVariant
								: theme.colors.custom.blue,
						borderRadius: 4,
						justifyContent: "center",
						alignItems: "center",
						marginRight: done ? 8 : 16,
						...(done
							? { paddingHorizontal: 6, paddingVertical: 2 }
							: { width: 32, height: 32 }),
					}}
				>
					<Text
						style={{
							color: theme.colors.custom.white,
							fontSize: done ? 13 : 16,
							fontWeight: "bold",
						}}
					>
						{number}
					</Text>
				</View>
				<Text
					style={{
						fontSize: done ? 13 : 16,
						fontWeight: done ? "500" : "bold",
						color: disabled
							? theme.colors.onSurfaceVariant
							: theme.colors.onSurface,
						flex: 1,
					}}
				>
					{title}
				</Text>
				{done && (
					<IconButton
						icon="pencil"
						size={18}
						iconColor={theme.colors.custom.green}
						onPress={onPress}
						style={{ margin: 0 }}
					/>
				)}
			</View>

			{/* Details grid (done state only) */}
			{done && details && details.length > 0 && (
				<View
					style={{
						flexDirection: "row",
						flexWrap: "wrap",
						gap: 4,
						marginBottom: 4,
					}}
				>
					{details.map(({ label, value }) => (
						<View
							key={label}
							style={{
								width: "48%",
								flexDirection: "row",
								gap: 4,
								marginBottom: 2,
							}}
						>
							<Text
								style={{
									fontSize: 12,
									color: theme.colors.onSurfaceVariant,
								}}
							>
								{label}:
							</Text>
							<Text
								style={{
									fontSize: 12,
									fontWeight: "500",
									color: theme.colors.onSurface,
									flex: 1,
								}}
								numberOfLines={1}
							>
								{value}
							</Text>
						</View>
					))}
				</View>
			)}

			{/* Action button (ready/disabled states only) */}
			{!done && (
				<Button
					mode="contained"
					onPress={disabled ? undefined : onPress}
					disabled={disabled}
					style={{ width: "100%", marginTop: 12 }}
					buttonColor={theme.colors.custom.blue}
					textColor={theme.colors.custom.white}
				>
					{actionLabel}
				</Button>
			)}
		</Pressable>
	)
}
