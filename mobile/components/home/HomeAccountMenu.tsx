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
import { Button, Divider, IconButton, Text } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import { SvgXml } from "react-native-svg"
import mobilePackage from "../../package.json"

type HomeAccountMenuProps = {
	user: MobileAuthUser
	visible: boolean
	onDismiss: () => void
	onLogout: () => void
}

export function HomeAccountMenu({
	user,
	visible,
	onDismiss,
	onLogout,
}: HomeAccountMenuProps) {
	const theme = useAppTheme()
	const { width } = useWindowDimensions()
	const menuAnimation = useRef(new Animated.Value(-1)).current
	const menuWidth = Math.min(width * 0.84, 360)
	const avatar = toSvg(user.avatarSeed, 72)

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

	const dismiss = () => {
		close(() => undefined)
	}

	const logout = () => {
		close(onLogout)
	}

	return (
		<Modal
			visible={visible}
			transparent
			statusBarTranslucent
			onRequestClose={dismiss}
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
					onPress={dismiss}
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
							flexDirection: "row",
							alignItems: "center",
							paddingHorizontal: 20,
							paddingVertical: 8,
						}}
					>
						<Text variant="titleLarge" style={{ flex: 1 }}>
							Mi cuenta
						</Text>
						<IconButton
							icon="close"
							onPress={dismiss}
							accessibilityLabel="Cerrar menú"
						/>
					</View>

					<Divider />

					<View
						style={{
							alignItems: "center",
							gap: 8,
							paddingHorizontal: 24,
							paddingVertical: 28,
						}}
					>
						<View
							style={{
								width: 80,
								height: 80,
								borderRadius: 999,
								backgroundColor: "#f8f885",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<SvgXml xml={avatar} width={72} height={72} />
						</View>
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
						<Button
							mode="outlined"
							icon="logout"
							onPress={logout}
							textColor={theme.colors.error}
							style={{ borderColor: theme.colors.error }}
						>
							Cerrar sesión
						</Button>
					</View>
				</SafeAreaView>
			</Animated.View>
		</Modal>
	)
}
