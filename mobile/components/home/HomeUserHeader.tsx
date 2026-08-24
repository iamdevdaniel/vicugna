import type { MobileAuthUser } from "@definitions/types"
import { toSvg } from "jdenticon/browser"
import { useState } from "react"
import { View } from "react-native"
import { Button, Card, IconButton, Text } from "react-native-paper"
import { SvgXml } from "react-native-svg"
import { HomeAccountMenu } from "./HomeAccountMenu"

type HomeUserHeaderProps = {
	user: MobileAuthUser | null
	onLogin: () => void
	onLogout: () => void
}

export function HomeUserHeader({
	user,
	onLogin,
	onLogout,
}: HomeUserHeaderProps) {
	const [isAccountMenuVisible, setIsAccountMenuVisible] = useState(false)

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

	const avatar = toSvg(user.avatarSeed, 44)

	return (
		<>
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					gap: 12,
					marginBottom: 16,
					padding: 4,
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
					<SvgXml xml={avatar} width={40} height={40} />
				</View>
				<View style={{ flex: 1 }}>
					<Text variant="titleMedium">{user.fullName}</Text>
				</View>
				<IconButton
					icon="menu"
					onPress={() => setIsAccountMenuVisible(true)}
					accessibilityLabel="Abrir menú de cuenta"
				/>
			</View>

			<HomeAccountMenu
				user={user}
				visible={isAccountMenuVisible}
				onDismiss={() => setIsAccountMenuVisible(false)}
				onLogout={onLogout}
			/>
		</>
	)
}
