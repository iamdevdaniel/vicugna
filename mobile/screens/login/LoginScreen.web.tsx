import { ThemeToggle } from "@components/basics/ThemeToggle.web"
import {
	Anchor,
	Button,
	Container,
	Paper,
	PasswordInput,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core"
import { Link } from "expo-router"

export default function WebLoginScreen() {
	return (
		<main
			style={{
				display: "grid",
				minHeight: "100vh",
				placeItems: "center",
				padding: "1.5rem",
			}}
		>
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
						<Stack>
							<TextInput
								label="Correo electrónico"
								placeholder="usuario@ejemplo.com"
								disabled
							/>
							<PasswordInput
								label="Contraseña"
								placeholder="Contraseña"
								disabled
							/>
							<Button disabled>Iniciar sesión</Button>
							<Text size="xs" c="dimmed" ta="center">
								El inicio de sesión se conectará después de
								probar la base de datos web.
							</Text>
						</Stack>
					</Paper>

					<Stack align="center" gap="xs">
						<Anchor component={Link} href="/" size="sm">
							Abrir estructura de prueba
						</Anchor>
						<ThemeToggle />
					</Stack>
				</Stack>
			</Container>
		</main>
	)
}
