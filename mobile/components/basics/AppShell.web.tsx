import {
	Button,
	Container,
	Group,
	Loader,
	AppShell as MantineAppShell,
	Stack,
	Text,
} from "@mantine/core"
import { useMobileAuthStore } from "@utils/auth-store"
import { useMessageStore } from "@utils/message-store.web"
import { Redirect } from "expo-router"
import type { ReactNode } from "react"
import { ThemeToggle } from "./ThemeToggle.web"

export function AppShell({ children }: { children: ReactNode }) {
	const isHydrated = useMobileAuthStore((state) => state.isHydrated)
	const isAuthenticated = useMobileAuthStore((state) => state.isAuthenticated)
	const user = useMobileAuthStore((state) => state.user)
	const logout = useMobileAuthStore((state) => state.logout)
	const dismissMessage = useMessageStore((state) => state.dismissMessage)
	const closeSession = () => {
		dismissMessage()
		logout()
	}

	if (!isHydrated) {
		return (
			<Group justify="center" h="100vh">
				<Loader />
			</Group>
		)
	}
	if (!isAuthenticated || !user) return <Redirect href="/login" />

	return (
		<MantineAppShell header={{ height: 72 }} padding="md">
			<MantineAppShell.Header>
				<Container size="xl" h="100%">
					<Group h="100%" justify="space-between">
						<Stack gap={0}>
							<Text fw={800}>Vicugna Campo</Text>
							<Text size="xs" c="dimmed">
								{user.fullName}
							</Text>
						</Stack>
						<Group gap="xs">
							<ThemeToggle />
							<Button
								onClick={closeSession}
								variant="outline"
								size="sm"
							>
								Cerrar sesión
							</Button>
						</Group>
					</Group>
				</Container>
			</MantineAppShell.Header>

			<MantineAppShell.Main>{children}</MantineAppShell.Main>
		</MantineAppShell>
	)
}
