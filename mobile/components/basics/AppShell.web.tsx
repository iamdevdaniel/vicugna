import {
	Button,
	Container,
	Group,
	AppShell as MantineAppShell,
	Stack,
	Text,
} from "@mantine/core"
import { Link } from "expo-router"
import type { ReactNode } from "react"
import { ThemeToggle } from "./ThemeToggle.web"

export function AppShell({ children }: { children: ReactNode }) {
	return (
		<MantineAppShell header={{ height: 72 }} padding="md">
			<MantineAppShell.Header>
				<Container size="xl" h="100%">
					<Group h="100%" justify="space-between">
						<Stack gap={0}>
							<Text fw={800}>Vicugna Campo</Text>
							<Text size="xs" c="dimmed">
								Versión para computadora portátil
							</Text>
						</Stack>
						<Group gap="xs">
							<ThemeToggle />
							<Button
								component={Link}
								href="/login"
								variant="outline"
								size="sm"
							>
								Volver
							</Button>
						</Group>
					</Group>
				</Container>
			</MantineAppShell.Header>

			<MantineAppShell.Main>{children}</MantineAppShell.Main>
		</MantineAppShell>
	)
}
