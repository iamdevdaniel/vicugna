import type React from "react"
import { StyleSheet, Text, View } from "react-native"
import { Card } from "react-native-paper"

type CardBaseProps = Omit<
	React.ComponentProps<typeof Card>,
	"elevation" | "mode"
>

export type AccentCardProps = CardBaseProps & {
	accent: string
	prefix: React.ReactNode
	mode?: "elevated" | "outlined" | "contained"
}

export function AccentCard({
	accent,
	prefix,
	children,
	style,
	mode = "elevated",
	...cardProps
}: AccentCardProps) {
	return (
		<Card {...cardProps} mode={mode} style={[styles.card, style]}>
			<View style={[styles.accent, { backgroundColor: accent }]}>
				<Text style={styles.prefix}>{prefix}</Text>
			</View>
			<View style={styles.content}>{children}</View>
		</Card>
	)
}

const styles = StyleSheet.create({
	card: {
		marginBottom: 0,
		borderRadius: 8,
		borderLeftWidth: 0,
		overflow: "hidden",
		position: "relative",
	},
	accent: {
		position: "absolute",
		left: 0,
		top: 0,
		bottom: 0,
		width: 32,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 1,
	},
	prefix: {
		color: "white",
		fontWeight: "bold",
		fontSize: 16,
		opacity: 0.8,
	},
	content: {
		paddingLeft: 40,
	},
})
