import { useAppTheme } from "@utils/useAppTheme"
import type { ReactNode } from "react"
import { Button } from "react-native-paper"

type CustomDeleteButtonProps = {
	onPress: () => void
	disabled?: boolean
	loading?: boolean
	style?: React.ComponentProps<typeof Button>["style"]
	children: ReactNode
}

export function CustomDeleteButton({
	onPress,
	disabled = false,
	loading = false,
	style,
	children,
}: CustomDeleteButtonProps) {
	const theme = useAppTheme()

	return (
		<Button
			mode="contained"
			onPress={onPress}
			disabled={disabled}
			loading={loading}
			style={[
				{
					backgroundColor: disabled
						? theme.colors.surfaceDisabled
						: theme.colors.custom.crimson,
				},
				style,
			]}
			textColor={
				disabled ? theme.colors.onSurfaceDisabled : theme.colors.onError
			}
		>
			{children}
		</Button>
	)
}
