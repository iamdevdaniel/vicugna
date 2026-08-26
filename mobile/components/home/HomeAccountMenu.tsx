import type { MobileAuthUser } from "@definitions/types"
import { useAppTheme } from "@utils/useAppTheme"
import { toSvg } from "jdenticon/browser"
import { useEffect, useRef } from "react"
import {
	Animated,
	Modal,
	Pressable,
	useWindowDimensions,
	View,
} from "react-native"
import { Button, Icon, Text } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import { SvgXml } from "react-native-svg"
import mobilePackage from "../../package.json"

type HomeAccountMenuProps = {
	user: MobileAuthUser | null
	visible: boolean
	onDismiss: () => void
	onLogin: () => void
	onLogout: () => void
}

export function HomeAccountMenu({
	user,
	visible,
	onDismiss,
	onLogin,
	onLogout,
}: HomeAccountMenuProps) {
	const theme = useAppTheme()
	const { width } = useWindowDimensions()
	const menuAnimation = useRef(new Animated.Value(-1)).current
	const menuWidth = Math.min(width * 0.84, 360)
	const avatar = user ? toSvg(user.avatarSeed, 72) : null

	useEffect(() => {
		if (!visible) return

		menuAnimation.setValue(-1)
		requestAnimationFrame(() => {
			Animated.timing(menuAnimation, {
				toValue: 0,
				duration: 180,
				useNativeDriver: true,
			}).start()
		})
	}, [menuAnimation, visible])

	const close = (onClosed: () => void) => {
		Animated.timing(menuAnimation, {
			toValue: -1,
			duration: 150,
			useNativeDriver: true,
		}).start(({ finished }) => {
			if (!finished) return

			onDismiss()
			onClosed()
		})
	}

	return (
		<Modal
			visible={visible}
			transparent
			statusBarTranslucent
			onRequestClose={() => close(() => undefined)}
		>
			<Animated.View
				style={{
					position: "absolute",
					top: 0,
					right: 0,
					bottom: 0,
					left: 0,
					backgroundColor: "rgba(0, 0, 0, 0.45)",
					opacity: menuAnimation.interpolate({
						inputRange: [-1, 0],
						outputRange: [0, 1],
					}),
				}}
			>
				<Pressable
					accessibilityLabel="Cerrar menú de cuenta"
					onPress={() => close(() => undefined)}
					style={{ flex: 1 }}
				/>
			</Animated.View>

			<Animated.View
				style={{
					width: menuWidth,
					height: "100%",
					backgroundColor: theme.colors.surface,
					transform: [
						{
							translateX: menuAnimation.interpolate({
								inputRange: [-1, 0],
								outputRange: [-menuWidth, 0],
							}),
						},
					],
				}}
			>
				<SafeAreaView style={{ flex: 1 }}>
					<View
						style={{
							height: 200,
							alignItems: "center",
							justifyContent: "center",
							gap: 8,
							paddingHorizontal: 24,
						}}
					>
						<View
							style={{
								width: 80,
								height: 80,
								borderRadius: 999,
								backgroundColor: user
									? theme.colors.custom.yellow
									: theme.colors.surfaceVariant,
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							{user && avatar ? (
								<SvgXml xml={avatar} width={72} height={72} />
							) : (
								<Icon
									source="account-off-outline"
									size={44}
									color={theme.colors.onSurfaceVariant}
								/>
							)}
						</View>
						{user ? (
							<>
								<Text
									variant="titleLarge"
									style={{ textAlign: "center" }}
								>
									{user.fullName}
								</Text>
								<Text
									variant="bodyMedium"
									style={{
										textAlign: "center",
										color: theme.colors.onSurfaceVariant,
									}}
								>
									{user.email}
								</Text>
							</>
						) : null}
					</View>

					<View
						style={{
							flex: 1,
							justifyContent: "flex-end",
							gap: 16,
							padding: 24,
						}}
					>
						<Text
							variant="bodySmall"
							style={{
								textAlign: "center",
								color: theme.colors.onSurfaceVariant,
							}}
						>
							Versión {mobilePackage.version}
						</Text>
						{user ? (
							<Button
								mode="outlined"
								icon="logout"
								onPress={() => close(onLogout)}
								textColor={theme.colors.error}
								style={{ borderColor: theme.colors.error }}
							>
								Cerrar sesión
							</Button>
						) : (
							<Button
								mode="contained"
								icon="login"
								onPress={() => close(onLogin)}
							>
								Iniciar sesión
							</Button>
						)}
					</View>
				</SafeAreaView>
			</Animated.View>
		</Modal>
	)
}
