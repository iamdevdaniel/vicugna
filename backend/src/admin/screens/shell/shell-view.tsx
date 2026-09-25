import {
	Box,
	Button,
	Container,
	Group,
	Paper,
	Progress,
	Stack,
	Text,
} from "@mantine/core"
import { Form, Link, Outlet } from "react-router"
import { useShellState } from "./shell-state"
import { ShellThemeToggle } from "./shell-theme-toggle"

type ShellViewProps = {
	adminUser: { fullName: string }
	app: { version: string; environment: string }
}

export function ShellView({ adminUser, app }: ShellViewProps) {
	const shell = useShellState()

	return (
		<Box mih="100vh" display="flex" style={{ flexDirection: "column" }}>
			{shell.isNavigating ? (
				<Progress
					value={70}
					animated
					pos="fixed"
					top={0}
					left={0}
					right={0}
					style={{ zIndex: 1000 }}
					aria-label="Cargando..."
				/>
			) : null}
			<Paper component="header" radius={0} withBorder p="md">
				<Container size="lg">
					<Group justify="space-between" gap="md" wrap="wrap">
						<Stack gap={3}>
							<Text
								component={Link}
								to="/"
								size="xs"
								fw={700}
								c="dimmed"
								style={{
									textTransform: "uppercase",
									letterSpacing: 0.5,
								}}
							>
								Administración Vicugna
							</Text>
							<Text fw={600}>{adminUser.fullName}</Text>
						</Stack>
						<Group gap={4}>
							<ShellThemeToggle onToggle={shell.toggleTheme} />
							<Form method="post" action="/logout" reloadDocument>
								<Button
									type="submit"
									variant="outline"
									size="sm"
								>
									Cerrar sesión
								</Button>
							</Form>
						</Group>
					</Group>
				</Container>
			</Paper>
			<Box style={{ flex: 1 }}>
				<Outlet />
			</Box>
			<Paper component="footer" radius={0} withBorder p="md">
				<Container size="lg">
					<Group justify="space-between" gap="xs" wrap="wrap">
						<Text size="xs" c="dimmed">
							Vicugna backend v{app.version}
						</Text>
						<Text size="xs" c="dimmed">
							Entorno: {app.environment}
						</Text>
					</Group>
				</Container>
			</Paper>
		</Box>
	)
}
