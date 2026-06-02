import { useAppTheme } from "@utils/useAppTheme"
import type { ReactNode } from "react"
import { Text, View } from "react-native"
import { Button, Card, IconButton } from "react-native-paper"

export const OverviewStep = ({
	number,
	title,
	onAction,
	state = "ready",
	details,
}: {
	number: number
	title: string
	onAction: () => void
	state: "ready" | "done" | "disabled"
	details?: ReactNode
}) => {
	const theme = useAppTheme()
	const disabled = state === "disabled"
	const done = state === "done"
	const hasDetails = !!details
	return (
		<Card mode="elevated" style={{ marginBottom: 20 }}>
			<Card.Content>
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						marginBottom: done && hasDetails ? 8 : 0,
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
							onPress={onAction}
							style={{ margin: 0 }}
						/>
					)}
				</View>
				{done && hasDetails && <View>{details}</View>}
				{!done && (
					<Button
						mode="contained"
						onPress={onAction}
						disabled={disabled}
						style={{ width: "100%", marginTop: 12 }}
						buttonColor={theme.colors.custom.blue}
						textColor={theme.colors.custom.white}
					>
						LLENAR
					</Button>
				)}
			</Card.Content>
		</Card>
	)
}
