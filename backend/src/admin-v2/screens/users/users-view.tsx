import { Link } from "react-router"
import type { UserListItem } from "../../../modules/users/user.types"
import { UsersCreateModal } from "./users-create-modal"
import { UsersList } from "./users-list"
import { useUsersState } from "./users-state"

type UsersViewProps = {
	users: UserListItem[]
	suggestedPassword: string
}

export function UsersView(props: UsersViewProps) {
	const state = useUsersState(props)
	const visibleUsers =
		state.activeTab === "users" ? state.regularUsers : state.adminUsers

	return (
		<main className="mx-auto max-w-6xl px-5 py-8">
			<header className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p className="text-xs font-bold uppercase tracking-wide text-base-content/55">
						Administración
					</p>
					<h1 className="mt-1 text-3xl font-semibold">Usuarios</h1>
					<p className="mt-2 text-sm text-base-content/60">
						Gestiona las personas con acceso al sistema.
					</p>
				</div>
			</header>

			<section className="mt-6 overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-sm">
				<div className="border-base-300 border-b px-5 pt-5">
					<div className="flex min-h-12 items-center justify-between gap-4">
						<h2 className="text-lg font-semibold">
							Usuarios registrados
						</h2>
						{state.activeTab === "users" ? (
							<button
								type="button"
								className="btn btn-primary"
								onClick={state.openModal}
							>
								Nuevo encargado
							</button>
						) : null}
					</div>
					<nav
						className="tabs tabs-border mt-5"
						aria-label="Tipos de usuario"
					>
						<UserTab
							href="#users"
							label="Encargados"
							count={state.regularUsers.length}
							active={state.activeTab === "users"}
						/>
						<UserTab
							href="#admins"
							label="Administradores"
							count={state.adminUsers.length}
							active={state.activeTab === "admins"}
						/>
					</nav>
				</div>
				<UsersList
					users={visibleUsers}
					emptyMessage={
						state.activeTab === "users"
							? "No hay encargados creados."
							: "No hay administradores creados."
					}
				/>
			</section>

			{state.isModalOpen ? <UsersCreateModal {...state} /> : null}
			{state.successMessage ? (
				<div className="toast toast-end z-50">
					<div className="alert alert-success" role="status">
						<span>{state.successMessage}</span>
						<button
							type="button"
							className="btn btn-ghost btn-xs"
							onClick={state.dismissSuccess}
						>
							Cerrar
						</button>
					</div>
				</div>
			) : null}
		</main>
	)
}

function UserTab({
	href,
	label,
	count,
	active,
}: {
	href: string
	label: string
	count: number
	active: boolean
}) {
	return (
		<Link
			to={href}
			preventScrollReset
			className={`tab ${active ? "tab-active" : ""}`}
		>
			{label}
			<span className="ml-2 badge badge-sm badge-ghost">{count}</span>
		</Link>
	)
}
