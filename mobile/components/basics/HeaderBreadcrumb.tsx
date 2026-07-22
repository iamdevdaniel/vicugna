import { useAppTheme } from "@utils/useAppTheme"
import { Text, View } from "react-native"

type HeaderBreadcrumbProps = {
	parts: string[]
}

export function HeaderBreadcrumb({ parts }: HeaderBreadcrumbProps) {
	const theme = useAppTheme()

	return (
		<View
			style={{
				flexDirection: "row",
				alignItems: "center",
				flexShrink: 1,
			}}
		>
			{parts.map((part, index) => {
				const breadcrumbKey = parts.slice(0, index + 1).join("::")

				return (
					<View
						key={breadcrumbKey}
						style={{
							flexDirection: "row",
							alignItems: "center",
							flexShrink: 1,
						}}
					>
						{index > 0 ? (
							<Text
								style={{
									marginHorizontal: 6,
									fontSize: 18,
									fontWeight: "700",
									color: theme.colors.onSurface,
								}}
							>
								‹
							</Text>
						) : null}
						<Text
							numberOfLines={1}
							style={{
								fontSize: 14,
								fontWeight: "600",
								color: theme.colors.onSurfaceVariant,
								flexShrink: 1,
							}}
						>
							{part}
						</Text>
					</View>
				)
			})}
		</View>
	)
}
