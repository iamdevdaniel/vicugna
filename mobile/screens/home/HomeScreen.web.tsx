import { AppShell } from "@components/basics/AppShell.web"
import {
	Badge,
	Container,
	Group,
	Paper,
	Stack,
	Text,
	Title,
} from "@mantine/core"

export default function WebHomeScreen() {
	return (
		<AppShell>
			<Container size="xl">
				<Stack gap="lg">
					<Group justify="space-between" align="flex-end">
						<div>
							<Title order={1}>Permisos</Title>
							<Text c="dimmed">
								La tabla se añadirá después de probar la
								persistencia local.
							</Text>
						</div>
						<Badge variant="light">Chrome PWA</Badge>
					</Group>

					<Paper withBorder p="xl">
						<Stack align="center" py={48} gap="xs">
							<Text fw={700}>Estructura web lista</Text>
							<Text c="dimmed" ta="center" maw={520}>
								Todavía no hay base de datos, permisos ni datos
								de prueba conectados.
							</Text>
						</Stack>
					</Paper>
				</Stack>
			</Container>
		</AppShell>
	)
}
