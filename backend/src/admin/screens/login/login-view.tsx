import {
	Alert,
	Anchor,
	Box,
	Button,
	Grid,
	Overlay,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core"
import { Form } from "react-router"
import { useLoginState } from "./login-state"

type LoginViewProps = {
	actionData?: {
		email: string
		errorMessage: string
	}
}

export function LoginView({ actionData }: LoginViewProps) {
	const login = useLoginState()

	return (
		<Grid component="main" gap={0} mih="100vh">
			<Grid.Col
				component="section"
				span={{ base: 12, md: 7 }}
				mih={{ base: 208, md: "100vh" }}
				pos="relative"
				style={{ overflow: "hidden" }}
			>
				<Box
					pos="absolute"
					inset={0}
					style={{
						backgroundImage: "url(/hero.webp)",
						backgroundPosition: "center",
						backgroundSize: "cover",
					}}
					role="img"
					aria-label="Vicuñas en su entorno natural"
				/>
				<Overlay gradient="linear-gradient(to top, rgba(30, 25, 20, .85), rgba(30, 25, 20, .15), transparent)" />
				<Box
					pos="absolute"
					left={0}
					right={0}
					bottom={0}
					p={{ base: 24, lg: 64 }}
					c="white"
				>
					<Text
						size="xs"
						fw={700}
						c="orange.3"
						style={{
							textTransform: "uppercase",
							letterSpacing: "0.3em",
						}}
					>
						ANMVB
					</Text>
					<Title order={1} mt="xs" size="3rem">
						vicugna app
					</Title>
				</Box>
			</Grid.Col>

			<Grid.Col
				component="section"
				span={{ base: 12, md: 5 }}
				display="flex"
				style={{ alignItems: "center", justifyContent: "center" }}
				p={{ base: 24, sm: 48 }}
				bg="var(--mantine-color-default)"
			>
				<Box w="100%" maw={384}>
					<Anchor component="a" href="/" fw={600} size="sm">
						← Volver al inicio
					</Anchor>
					<Text mt="md" size="xs" fw={700} c="dimmed" tt="uppercase">
						Acceso administrativo
					</Text>
					<Title order={2} mt="xs">
						Inicio de sesión
					</Title>
					<Text mt="xs" size="sm" c="dimmed">
						Gestión de asignaciones y seguimiento de permisos.
					</Text>

					<Form
						method="post"
						reloadDocument
						style={{ marginTop: 24 }}
					>
						<Stack gap="md">
							{actionData?.errorMessage ? (
								<Alert color="red" role="alert">
									{actionData.errorMessage}
								</Alert>
							) : null}
							<TextInput
								label="Correo"
								type="email"
								name="email"
								defaultValue={actionData?.email ?? ""}
								placeholder="correo@ejemplo.com"
								autoComplete="username"
							/>
							<TextInput
								label="Contraseña"
								type={login.showPassword ? "text" : "password"}
								name="password"
								placeholder="********"
								autoComplete="current-password"
								rightSectionWidth={88}
								rightSection={
									<Button
										type="button"
										variant="subtle"
										size="compact-sm"
										onClick={login.togglePassword}
									>
										{login.showPassword
											? "Ocultar"
											: "Mostrar"}
									</Button>
								}
							/>
							<Button type="submit" fullWidth mt={4}>
								Entrar
							</Button>
						</Stack>
					</Form>
				</Box>
			</Grid.Col>
		</Grid>
	)
}
