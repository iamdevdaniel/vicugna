import type { MobileAuthUser } from "@definitions/types"
import { useAppTheme } from "@utils/useAppTheme"
import { toSvg } from "jdenticon/browser"
import { useState } from "react"
import { Image, View } from "react-native"
import { Button, IconButton, Text } from "react-native-paper"
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
	const avatar = user ? toSvg(user.avatarSeed, 44) : null
	const theme = useAppTheme()

	return (
		<>
			<View
				style={{
					height: 48,
					marginBottom: 16,
					flexDirection: "row",
					alignItems: "center",
					paddingHorizontal: 4,
					borderRadius: user ? 0 : 12,
					backgroundColor: user
						? undefined
						: theme.colors.custom.yellow,
				}}
			>
				<IconButton
					icon="menu"
					onPress={() => setIsAccountMenuVisible(true)}
					accessibilityLabel="Abrir menú de cuenta"
				/>
				{user ? (
					<>
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
									backgroundColor: theme.colors.custom.yellow,
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								{avatar ? (
									<SvgXml
										xml={avatar}
										width={34}
										height={34}
									/>
								) : null}
							</View>
						</View>
					</>
				) : (
					<>
						<View style={{ flex: 1 }}>
							<Text variant="labelLarge">Sin iniciar sesión</Text>
						</View>
						<Button
							mode="outlined"
							onPress={onLogin}
							style={{ marginRight: 6 }}
							labelStyle={{
								fontSize: 11,
								marginHorizontal: 14,
								lineHeight: 14,
							}}
						>
							Iniciar sesión
						</Button>
					</>
				)}
			</View>

			<HomeAccountMenu
				user={user}
				visible={isAccountMenuVisible}
				onDismiss={() => setIsAccountMenuVisible(false)}
				onLogin={onLogin}
				onLogout={onLogout}
			/>
		</>
	)
}
