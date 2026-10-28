import {
	ActionIcon,
	Box,
	Button,
	Container,
	Group,
	Paper,
	Progress,
	Text,
} from "@mantine/core"
import { Form, Link, Outlet } from "react-router"
import { useShellState } from "./shell-state"
import { ShellThemeToggle } from "./shell-theme-toggle"

type ShellViewProps = {
	adminUser: { fullName: string }
}

export function ShellView({ adminUser }: ShellViewProps) {
	const shell = useShellState()

	return (
		<Box mih="100dvh" display="flex" style={{ flexDirection: "column" }}>
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
			<Paper
				component="header"
				radius={0}
				pos="sticky"
				top={0}
				h={52}
				style={{
					zIndex: 100,
					flex: "0 0 52px",
					background: "var(--admin-header-bg)",
				}}
			>
				<Container size="lg" h="100%">
					<Group
						justify="space-between"
						gap="md"
						wrap="nowrap"
						h="100%"
					>
						<Group gap="xs" wrap="nowrap">
							<ActionIcon
								component={Link}
								to="/"
								variant="subtle"
								size="lg"
								aria-label="Ir al inicio"
							>
								<HomeIcon />
							</ActionIcon>
							<Text fw={700} size="sm">
								Vicugna
							</Text>
						</Group>
						<Group gap={4}>
							<Text visibleFrom="sm" size="sm" fw={500} mr="xs">
								{adminUser.fullName}
							</Text>
							<ShellThemeToggle
								colorScheme={shell.colorScheme}
								onToggle={shell.toggleTheme}
							/>
							<Form method="post" action="/logout" reloadDocument>
								<Button
									type="submit"
									variant="subtle"
									size="compact-sm"
									leftSection={<LogOutIcon />}
								>
									Cerrar sesión
								</Button>
							</Form>
						</Group>
					</Group>
				</Container>
			</Paper>
			<Box style={{ minHeight: 0, flex: 1 }}>
				<Outlet />
			</Box>
		</Box>
	)
}

function HomeIcon() {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="m3 11 9-8 9 8" />
			<path d="M5 10v10h14V10" />
			<path d="M9 20v-6h6v6" />
		</svg>
	)
}

function LogOutIcon() {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M10 17l5-5-5-5M15 12H3" />
			<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
		</svg>
	)
}
