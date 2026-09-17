import { Form, Outlet, redirect, useLoaderData } from "react-router"
import { adminSessionContext } from "../../admin-v2-context.server"
import type { Route } from "./+types/protected"

export function loader({ context }: Route.LoaderArgs) {
	const session = context.get(adminSessionContext)

	if (session.adminUser?.role !== "admin") {
		return redirect("/login")
	}

	return { adminUser: session.adminUser }
}

export default function ProtectedAdminLayout() {
	const { adminUser } = useLoaderData<typeof loader>()

	return (
		<div className="min-h-screen bg-base-200">
			<header className="border-base-300 border-b bg-base-100">
				<div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
					<div>
						<p className="text-xs font-bold uppercase tracking-wide text-base-content/55">
							Administrador
						</p>
						<p className="font-semibold">{adminUser.fullName}</p>
					</div>
					<Form method="post" action="/logout" reloadDocument>
						<button type="submit" className="btn btn-ghost btn-sm">
							Cerrar sesión
						</button>
					</Form>
				</div>
			</header>
			<Outlet />
		</div>
	)
}
