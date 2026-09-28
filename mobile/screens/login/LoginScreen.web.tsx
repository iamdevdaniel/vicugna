import { ThemeToggle } from "@components/basics/ThemeToggle.web"
import {
	Button,
	Container,
	Loader,
	Paper,
	PasswordInput,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core"
import { useMobileAuthStore } from "@utils/auth-store"
import { useMessageStore } from "@utils/message-store.web"
import { Redirect, router } from "expo-router"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

type LoginForm = {
	email: string
	password: string
}

export default function WebLoginScreen() {
	const isHydrated = useMobileAuthStore((state) => state.isHydrated)
	const isAuthenticated = useMobileAuthStore((state) => state.isAuthenticated)
	const isLoggingIn = useMobileAuthStore((state) => state.isLoggingIn)
	const user = useMobileAuthStore((state) => state.user)
	const error = useMobileAuthStore((state) => state.error)
	const login = useMobileAuthStore((state) => state.login)
	const clearError = useMobileAuthStore((state) => state.clearError)
	const showMessage = useMessageStore((state) => state.showMessage)
	const dismissMessage = useMessageStore((state) => state.dismissMessage)
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginForm>({
		defaultValues: { email: "", password: "" },
	})

	useEffect(() => {
		if (error) showMessage("error", error)
	}, [error, showMessage])

	if (!isHydrated) {
		return (
			<main style={centeredPageStyle}>
				<Loader />
			</main>
		)
	}
	if (isAuthenticated && user) return <Redirect href="/" />

	const submit = handleSubmit(async ({ email, password }) => {
		dismissMessage()
		const ok = await login(email, password)
		if (ok) {
			showMessage("success", "Sesión iniciada")
			router.replace("/")
		}
	})

	return (
		<main style={centeredPageStyle}>
			<Container size={440} w="100%">
				<Stack gap="lg">
					<Stack gap={4} align="center">
						<Text size="sm" fw={700} c="sage.7">
							VICUGNA
						</Text>
						<Title order={1}>Trabajo de campo</Title>
						<Text c="dimmed" ta="center">
							Versión para computadora portátil
						</Text>
					</Stack>

					<Paper withBorder shadow="sm" p="xl">
						<form onSubmit={submit}>
							<Stack>
								<TextInput
									label="Correo electrónico"
									placeholder="usuario@ejemplo.com"
									autoComplete="off"
									error={errors.email?.message}
									{...register("email", {
										required: "Ingrese su correo",
										onChange: clearError,
									})}
								/>
								<PasswordInput
									label="Contraseña"
									placeholder="Contraseña"
									autoComplete="current-password"
									error={errors.password?.message}
									{...register("password", {
										required: "Ingrese su contraseña",
										onChange: clearError,
									})}
								/>
								<Button type="submit" loading={isLoggingIn}>
									Iniciar sesión
								</Button>
							</Stack>
						</form>
					</Paper>

					<Stack align="center">
						<ThemeToggle />
					</Stack>
				</Stack>
			</Container>
		</main>
	)
}

const centeredPageStyle = {
	display: "grid",
	minHeight: "100vh",
	placeItems: "center",
	padding: "1.5rem",
}
