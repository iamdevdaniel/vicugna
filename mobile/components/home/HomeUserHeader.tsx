import type { MobileAuthUser } from "@definitions/types"
import { toSvg } from "jdenticon/browser"
import { useState } from "react"
import { Image, View } from "react-native"
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
					marginBottom: 16,
					paddingHorizontal: 4,
				}}
			>
				<IconButton
					icon="menu"
					onPress={() => setIsAccountMenuVisible(true)}
					accessibilityLabel="Abrir menú de cuenta"
				/>
				<View style={{ flex: 1, alignItems: "center" }}>
					<Image
						source={require("../../assets/images/vicugna-splash-title.png")}
						resizeMode="contain"
						style={{ width: 150, height: 34 }}
					/>
				</View>
				<View style={{ width: 48, alignItems: "flex-end" }}>
					<View
						style={{
							width: 40,
							height: 40,
							borderRadius: 999,
							backgroundColor: "#f8f885",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<SvgXml xml={avatar} width={34} height={34} />
					</View>
				</View>
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
