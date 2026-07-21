import type { MobileAuthUser } from "@definitions/types"
import { View } from "react-native"
import { Button, Card, Text } from "react-native-paper"
import { SvgXml } from "react-native-svg"
import jdenticon from "../../vendor/jdenticon.min.js"

type HomeUserHeaderProps = {
	user: MobileAuthUser | null
	onLogin: () => void
}

export function HomeUserHeader({ user, onLogin }: HomeUserHeaderProps) {
	if (!user) {
		return (
			<Card
				style={{
					marginBottom: 16,
					backgroundColor: "#FDE68A",
				}}
			>
				<Card.Content
					style={{
						flexDirection: "row",
						alignItems: "center",
						gap: 8,
					}}
				>
					<View style={{ flex: 1 }}>
						<Text variant="labelLarge">Sin iniciar sesión</Text>
					</View>
					<Button mode="contained" onPress={onLogin}>
						Iniciar sesión
					</Button>
				</Card.Content>
			</Card>
		)
	}

	const svg = jdenticon.toSvg(user.avatarSeed, 44)

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
					<Text variant="titleMedium">{user.fullName}</Text>
					<Text variant="bodySmall">{user.email}</Text>
				</View>
			</Card.Content>
		</Card>
	)
}
