import { useMobileAuthStore } from "@utils/auth-store"
import { ROUTES } from "@utils/constants"
import { useAppTheme } from "@utils/useAppTheme"
import { Redirect } from "expo-router"
import { useState } from "react"
import { View } from "react-native"
import {
	ActivityIndicator,
	Button,
	Card,
	Text,
	TextInput,
} from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

export default function LoginScreen() {
	const theme = useAppTheme()
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [isPasswordVisible, setIsPasswordVisible] = useState(false)
	const { token, user, error, isHydrated, isLoggingIn, login, clearError } =
		useMobileAuthStore()

	const onLogin = async () => {
		const ok = await login(email, password)

		if (ok) {
			setPassword("")
		}
	}

	if (isHydrated && token && user) {
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
						{!isHydrated ? (
							<View
								style={{
									alignItems: "center",
									justifyContent: "center",
									paddingVertical: 24,
								}}
							>
								<ActivityIndicator animating size="small" />
							</View>
						) : (
							<>
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
									secureTextEntry={!isPasswordVisible}
									right={
										<TextInput.Icon
											icon={
												isPasswordVisible
													? "eye-off-outline"
													: "eye-outline"
											}
											onPress={() =>
												setIsPasswordVisible(
													(value) => !value,
												)
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
									disabled={
										isLoggingIn ||
										!email.trim() ||
										!password
									}
								>
									Iniciar sesión
								</Button>
							</>
						)}
					</Card.Content>
				</Card>
			</View>
		</SafeAreaView>
	)
}
