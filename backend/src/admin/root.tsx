import "@mantine/core/styles.css"

import {
	Button,
	ColorSchemeScript,
	Container,
	MantineProvider,
	mantineHtmlProps,
	Paper,
	Stack,
	Text,
	Title,
} from "@mantine/core"
import { type ReactNode, useEffect, useState } from "react"
import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router"
import {
	adminColorSchemeManager,
	adminCssVariablesResolver,
	adminTheme,
	adminThemeStorageKey,
} from "./theme"

export function Layout({ children }: { children: ReactNode }) {
	return (
		<html lang="es" {...mantineHtmlProps}>
			<head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1"
				/>
				<Meta />
				<ColorSchemeScript
					defaultColorScheme="light"
					localStorageKey={adminThemeStorageKey}
				/>
				<Links />
				<link
					rel="icon"
					type="image/png"
					href={
						import.meta.env.DEV
							? "/favicon-dev.png"
							: "/favicon.png"
					}
				/>
			</head>
			<body>
				<MantineProvider
					theme={adminTheme}
					cssVariablesResolver={adminCssVariablesResolver}
					colorSchemeManager={adminColorSchemeManager}
					defaultColorScheme="light"
					deduplicateInlineStyles
				>
					<HydrationStatus>{children}</HydrationStatus>
				</MantineProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	)
}

function HydrationStatus({ children }: { children: ReactNode }) {
	const [isHydrated, setIsHydrated] = useState(false)

	useEffect(() => {
		setIsHydrated(true)
	}, [])

	return (
		<div data-admin-hydrated={isHydrated ? "true" : "false"}>
			{children}
		</div>
	)
}

export default function AdminRoot() {
	return <Outlet />
}

export function ErrorBoundary({ error }: { error: unknown }) {
	let title = "No se pudo cargar la página"
	let message = "Ocurrió un error inesperado. Intenta nuevamente."

	if (isRouteErrorResponse(error)) {
		title =
			error.status === 404
				? "Página no encontrada"
				: `Error ${error.status}`
		message =
			error.status === 404
				? "La página solicitada no existe."
				: "No se pudo completar la solicitud. Intenta nuevamente."

		if (error.status >= 500) {
			console.error("Admin route error", error)
		}
	} else if (import.meta.env.DEV && error instanceof Error) {
		console.error("Admin route error", error)
		message = error.message
	} else {
		console.error("Admin route error", error)
	}

	return (
		<Container component="main" size="sm" py={48} mih="100vh">
			<Paper withBorder shadow="sm" p="xl">
				<Stack align="flex-start">
					<Title order={1} size="h2">
						{title}
					</Title>
					<Text>{message}</Text>
					<Button component="a" href="/admin/" mt="sm">
						Volver al inicio
					</Button>
				</Stack>
			</Paper>
		</Container>
	)
}
