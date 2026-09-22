import {
	Form,
	Link,
	NavLink,
	Outlet,
	useLoaderData,
	useNavigation,
} from "react-router"
import { requireAdminSession } from "../admin-auth.server"
import { getAdminAppInfo } from "../admin-info.server"
import { ThemeToggle } from "../components/theme-toggle"
import type { Route } from "./+types/protected"

export function loader({ context }: Route.LoaderArgs) {
	return { adminUser: requireAdminSession(context), app: getAdminAppInfo() }
}

export default function ProtectedAdminLayout() {
	const { adminUser, app } = useLoaderData<typeof loader>()
	const navigation = useNavigation()

	return (
		<div className="flex min-h-screen flex-col bg-base-200">
			{navigation.state !== "idle" ? (
				<div
					className="fixed inset-x-0 top-0 z-50 h-1 animate-pulse bg-primary"
					role="status"
				>
					<span className="sr-only">Cargando...</span>
				</div>
			) : null}
			<header className="border-base-300 border-b bg-base-100">
				<div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
					<div>
						<Link
							to="/"
							className="text-xs font-bold uppercase tracking-wide text-base-content/55 hover:text-primary"
						>
							Administración Vicugna
						</Link>
						<p className="mt-1 font-semibold">
							{adminUser.fullName}
						</p>
					</div>
					<div className="flex items-center gap-1">
						<ThemeToggle />
						<Form method="post" action="/logout" reloadDocument>
							<button
								type="submit"
								className="btn btn-outline btn-primary btn-sm"
							>
								Cerrar sesión
							</button>
						</Form>
					</div>
				</div>
				<nav
					className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 pb-3"
					aria-label="Secciones administrativas"
				>
					<NavLink
						to="/"
						end
						className={({ isActive }) =>
							getNavigationClassName(isActive)
						}
					>
						Inicio
					</NavLink>
					<NavLink
						to="/users"
						className={({ isActive }) =>
							getNavigationClassName(isActive)
						}
					>
						Usuarios
					</NavLink>
					<NavLink
						to="/assignments"
						className={({ isActive }) =>
							getNavigationClassName(isActive)
						}
					>
						Asignaciones
					</NavLink>
					<a
						href="/admin/monitoring"
						className="btn btn-ghost btn-sm"
					>
						Seguimiento
					</a>
				</nav>
			</header>
			<div className="flex-1">
				<Outlet />
			</div>
			<footer className="border-base-300 border-t bg-base-100">
				<div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-5 py-4 text-xs text-base-content/55">
					<span>Vicugna backend v{app.version}</span>
					<span>Entorno: {app.environment}</span>
				</div>
			</footer>
		</div>
	)
}

function getNavigationClassName(isActive: boolean) {
	return `btn btn-ghost btn-sm ${isActive ? "btn-active" : ""}`
}
