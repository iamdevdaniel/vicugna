import { View } from "react-native"
import { Card, Text } from "react-native-paper"
import { SvgXml } from "react-native-svg"
import jdenticon from "../../vendor/jdenticon.min.js"

type HomeUserHeaderProps = {
	fullName: string
	email: string
	avatarSeed: string
}

export function HomeUserHeader({
	fullName,
	email,
	avatarSeed,
}: HomeUserHeaderProps) {
	const svg = jdenticon.toSvg(avatarSeed, 44)

	return (
		<Card>
			<Card.Content
				style={{
					flexDirection: "row",
					alignItems: "center",
					gap: 12,
				}}
			>
				<View
					style={{
						width: 48,
						height: 48,
						borderRadius: 999,
						backgroundColor: "#f8f885",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<SvgXml xml={svg} width={40} height={40} />
				</View>
				<View style={{ flex: 1 }}>
					<Text variant="titleMedium">{fullName}</Text>
					<Text variant="bodySmall">{email}</Text>
				</View>
			</Card.Content>
		</Card>
	)
}
