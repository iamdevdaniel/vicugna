import type { ReactNode } from "react"
import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router"

export function Layout({ children }: { children: ReactNode }) {
	return (
		<html lang="es" data-theme="light">
			<head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1"
				/>
				<Meta />
				<Links />
				<link rel="stylesheet" href="/admin.css" />
			</head>
			<body className="min-h-screen bg-base-200 text-base-content">
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	)
}

export default function AdminV2Root() {
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
			console.error("Admin v2 route error", error)
		}
	} else if (import.meta.env.DEV && error instanceof Error) {
		console.error("Admin v2 route error", error)
		message = error.message
	} else {
		console.error("Admin v2 route error", error)
	}

	return (
		<main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-12">
			<section className="card w-full border border-base-300 bg-base-100 shadow-sm">
				<div className="card-body">
					<h1 className="card-title text-2xl">{title}</h1>
					<p>{message}</p>
					<a className="btn btn-primary mt-4 w-fit" href="/admin-v2">
						Volver al inicio
					</a>
				</div>
			</section>
		</main>
	)
}
