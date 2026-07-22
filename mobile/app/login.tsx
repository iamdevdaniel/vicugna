import { useMobileAuthStore } from "@utils/auth-store"
import { ROUTES } from "@utils/constants"
import { useAppTheme } from "@utils/useAppTheme"
import { Redirect } from "expo-router"
import { useState } from "react"
import { View } from "react-native"
import { Button, Card, Text, TextInput } from "react-native-paper"
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
			style={{ flex: 1, backgroundColor: theme.colors.background }}
		>
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					padding: 16,
				}}
			>
				<Card>
					<Card.Content style={{ gap: 12 }}>
						<Text variant="titleMedium">
							Inicio de sesión móvil
						</Text>
						<TextInput
							mode="outlined"
							label="Correo"
							value={email}
							onChangeText={(value) => {
								if (error) {
									clearError()
								}

								setEmail(value)
							}}
							autoCapitalize="none"
							autoCorrect={false}
							keyboardType="email-address"
						/>
						<TextInput
							mode="outlined"
							label="Contraseña"
							value={password}
							onChangeText={(value) => {
								if (error) {
									clearError()
								}

								setPassword(value)
							}}
							autoCapitalize="none"
							autoCorrect={false}
							secureTextEntry={!isPasswordVisible}
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
						{error ? (
							<Text style={{ color: theme.colors.error }}>
								{error}
							</Text>
						) : null}
						<Button
							mode="contained"
							onPress={onLogin}
							loading={isLoggingIn}
							disabled={isLoggingIn || !email.trim() || !password}
						>
							Iniciar sesión
						</Button>
					</Card.Content>
				</Card>
			</View>
		</SafeAreaView>
	)
}
