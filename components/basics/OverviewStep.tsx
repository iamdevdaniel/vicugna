import { useAppTheme } from "@utils/useAppTheme"
import type { ReactNode } from "react"
import { Text, View } from "react-native"
import { Button, Card, IconButton } from "react-native-paper"
import type { IconSource } from "react-native-paper/lib/typescript/components/Icon"

export type OverviewStepAction = {
	icon: IconSource
	onPress: () => void
}

export const OverviewStep = ({
	number,
	title,
	action,
	state = "ready",
	details,
}: {
	number: number
	title: string
	action?: OverviewStepAction
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
					{done && action && (
						<IconButton
							icon={action.icon}
							size={18}
							iconColor={theme.colors.custom.green}
							onPress={action.onPress}
							style={{ margin: 0 }}
						/>
					)}
				</View>
				{done && hasDetails && <View>{details}</View>}
				{!done && (
					<Button
						mode="contained"
						onPress={action?.onPress}
						disabled={disabled || !action}
						style={{ width: "100%", marginTop: 12 }}
						buttonColor={theme.colors.custom.blue}
						textColor={theme.colors.custom.white}
						icon={action?.icon}
					>
						LLENAR
					</Button>
				)}
			</Card.Content>
		</Card>
	)
}
