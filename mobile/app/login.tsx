import { useMobileAuthStore } from "@utils/auth-store"
import { ROUTES } from "@utils/constants"
import { useAppTheme } from "@utils/useAppTheme"
import { Redirect } from "expo-router"
import { useState } from "react"
import { Image, KeyboardAvoidingView, View } from "react-native"
import { Button, Text, TextInput } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import { useShallow } from "zustand/react/shallow"

export default function LoginScreen() {
	const theme = useAppTheme()
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [isPasswordVisible, setIsPasswordVisible] = useState(false)
	const {
		isHydrated,
		isAuthenticated,
		error,
		isLoggingIn,
		login,
		clearError,
	} = useMobileAuthStore(
		useShallow((state) => ({
			isHydrated: state.isHydrated,
			isAuthenticated: state.isAuthenticated,
			error: state.error,
			isLoggingIn: state.isLoggingIn,
			login: state.login,
			clearError: state.clearError,
		})),
	)

	const onLogin = async () => {
		const ok = await login(email, password)

		if (ok) {
			setPassword("")
		}
	}

	if (isHydrated && isAuthenticated) {
		return <Redirect href={ROUTES.HOME} />
	}

	return (
		<SafeAreaView
			style={{
				flex: 1,
				backgroundColor: theme.colors.custom.pastelYellow,
			}}
		>
			<KeyboardAvoidingView
				behavior="height"
				style={{
					flex: 1,
				}}
			>
				<Image
					source={require("../assets/images/vicugna-logo-hero.png")}
					resizeMode="cover"
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						width: "100%",
						height: "48%",
					}}
				/>

				<View
					style={{
						position: "absolute",
						left: 0,
						right: 0,
						bottom: 0,
						height: "60%",
						paddingHorizontal: 28,
						paddingTop: 28,
						paddingBottom: 24,
						justifyContent: "space-between",
						backgroundColor: theme.colors.surface,
						borderTopLeftRadius: 36,
						borderTopRightRadius: 36,
						shadowColor: "#000",
						shadowOffset: { width: 0, height: -4 },
						shadowOpacity: 0.08,
						shadowRadius: 12,
						elevation: 8,
					}}
				>
					<Text
						variant="titleLarge"
						style={{
							color: theme.colors.onSurface,
							fontWeight: "700",
							marginBottom: 4,
						}}
					>
						Inicio de sesión
					</Text>
					<View style={{ gap: 12 }}>
						<TextInput
							mode="outlined"
							dense
							label="Correo"
							value={email}
							onChangeText={(value) => {
								if (error) clearError()
								setEmail(value)
							}}
							autoCapitalize="none"
							autoCorrect={false}
							keyboardType="email-address"
							left={<TextInput.Icon icon="email-outline" />}
						/>
						<TextInput
							mode="outlined"
							dense
							label="Contraseña"
							value={password}
							onChangeText={(value) => {
								if (error) clearError()
								setPassword(value)
							}}
							autoCapitalize="none"
							autoCorrect={false}
							secureTextEntry={!isPasswordVisible}
							left={<TextInput.Icon icon="lock-outline" />}
							right={
								<TextInput.Icon
									icon={
										isPasswordVisible
											? "eye-off-outline"
											: "eye-outline"
									}
									onPress={() =>
										setIsPasswordVisible((value) => !value)
									}
								/>
							}
						/>
					</View>
					{error ? (
						<Text
							style={{ color: theme.colors.error }}
							variant="bodySmall"
						>
							{error}
						</Text>
					) : null}
					<Button
						mode="contained"
						onPress={onLogin}
						loading={isLoggingIn}
						disabled={isLoggingIn || !email.trim() || !password}
						contentStyle={{ height: 50 }}
						style={{ borderRadius: 12, marginTop: 2 }}
					>
						Iniciar sesión
					</Button>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}
