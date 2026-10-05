import { openWebDatabase } from "@database/web"
import type { MobileAuthUser } from "@definitions/types"
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
import { type ReactNode, useEffect, useState } from "react"
import { ThemeToggle } from "./ThemeToggle.web"

export function AppShell({ children }: { children: ReactNode }) {
	const logout = useMobileAuthStore((state) => state.logout)
	const dismissMessage = useMessageStore((state) => state.dismissMessage)
	const closeSession = () => {
		dismissMessage()
		logout()
	}

	return (
		<AuthenticatedGate>
			{(user) => (
				<WebDatabaseGate
					accountId={user.id}
					onCloseSession={closeSession}
				>
					<AppFrame user={user} onCloseSession={closeSession}>
						{children}
					</AppFrame>
				</WebDatabaseGate>
			)}
		</AuthenticatedGate>
	)
}

function AuthenticatedGate({
	children,
}: {
	children: (user: MobileAuthUser) => ReactNode
}) {
	const isHydrated = useMobileAuthStore((state) => state.isHydrated)
	const isAuthenticated = useMobileAuthStore((state) => state.isAuthenticated)
	const user = useMobileAuthStore((state) => state.user)

	if (!isHydrated) {
		return (
			<Group justify="center" h="100vh">
				<Loader />
			</Group>
		)
	}
	if (!isAuthenticated || !user) return <Redirect href="/login" />

	return children(user)
}

function WebDatabaseGate({
	accountId,
	onCloseSession,
	children,
}: {
	accountId: string
	onCloseSession: () => void
	children: ReactNode
}) {
	const [databaseStatus, setDatabaseStatus] = useState<
		"checking" | "ready" | "error"
	>("checking")

	useEffect(() => {
		let active = true
		setDatabaseStatus("checking")
		void openWebDatabase(accountId)
			.then(() => {
				if (active) setDatabaseStatus("ready")
			})
			.catch(() => {
				if (active) setDatabaseStatus("error")
			})

		return () => {
			active = false
		}
	}, [accountId])

	if (databaseStatus === "checking") {
		return (
			<Group justify="center" h="100vh">
				<Loader />
			</Group>
		)
	}
	if (databaseStatus === "error") {
		return (
			<Container size="sm" py="xl">
				<Stack>
					<Text fw={700}>
						No se pudieron abrir los datos locales.
					</Text>
					<Text>
						Cierre Vicugna, compruebe que el equipo tenga espacio
						disponible y vuelva a abrirla. No borre los datos de
						Chrome.
					</Text>
					<Button onClick={onCloseSession} variant="outline">
						Cerrar sesión
					</Button>
				</Stack>
			</Container>
		)
	}

	return children
}

function AppFrame({
	user,
	onCloseSession,
	children,
}: {
	user: MobileAuthUser
	onCloseSession: () => void
	children: ReactNode
}) {
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
								onClick={onCloseSession}
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
