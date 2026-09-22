import type { RefObject } from "react"
import { useEffect, useRef, useState } from "react"
import {
	data,
	Link,
	useFetcher,
	useLoaderData,
	useLocation,
} from "react-router"
import { UserManagementError } from "../../modules/users/user.errors"
import {
	getUsersPageState,
	registerUser,
} from "../../modules/users/user.service"
import { requireAdminSession } from "../admin-auth.server"
import { UsersList } from "../components/users-list"
import type { Route } from "./+types/users"

export function meta() {
	return [{ title: "Usuarios | Administración Vicugna" }]
}

export async function loader({ context }: Route.LoaderArgs) {
	requireAdminSession(context)
	return getUsersPageState()
}

export async function action({ request, context }: Route.ActionArgs) {
	requireAdminSession(context)

	let formData: FormData
	try {
		formData = await request.formData()
	} catch {
		return data(
			{
				ok: false as const,
				errorMessage: "El formulario enviado no es válido",
			},
			{ status: 400 },
		)
	}

	try {
		await registerUser({
			firstName: getTextField(formData, "firstName"),
			paternalLastName: getTextField(formData, "paternalLastName"),
			maternalLastName: getTextField(formData, "maternalLastName"),
			phoneNumber: getTextField(formData, "phoneNumber"),
			email: getTextField(formData, "email"),
			password: getTextField(formData, "password"),
		})

		return data(
			{ ok: true as const, successMessage: "Usuario creado" },
			{ status: 201 },
		)
	} catch (error) {
		const isManagementError = error instanceof UserManagementError

		if (!isManagementError) {
			console.error("Admin v2 user creation failed", error)
		}

		return data(
			{
				ok: false as const,
				errorMessage: isManagementError
					? error.message
					: "No se pudo crear el usuario",
			},
			{ status: isManagementError ? 400 : 500 },
		)
	}
}

function getTextField(formData: FormData, name: string) {
	const value = formData.get(name)
	return typeof value === "string" ? value : ""
}

export default function UsersPage() {
	const { users, suggestedPassword } = useLoaderData<typeof loader>()
	const location = useLocation()
	const activeTab = location.hash === "#admins" ? "admins" : "users"
	const regularUsers = users.filter((user) => user.role === "user")
	const adminUsers = users.filter((user) => user.role === "admin")

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
				<UsersPanelHeader
					activeTab={activeTab}
					regularUsersCount={regularUsers.length}
					adminUsersCount={adminUsers.length}
					suggestedPassword={suggestedPassword}
				/>
				{activeTab === "users" ? (
					<UsersList
						users={regularUsers}
						emptyMessage="No hay encargados creados."
					/>
				) : (
					<UsersList
						users={adminUsers}
						emptyMessage="No hay administradores creados."
					/>
				)}
			</section>
		</main>
	)
}

type UsersPanelHeaderProps = {
	activeTab: "users" | "admins"
	regularUsersCount: number
	adminUsersCount: number
	suggestedPassword: string
}

function UsersPanelHeader({
	activeTab,
	regularUsersCount,
	adminUsersCount,
	suggestedPassword,
}: UsersPanelHeaderProps) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [successMessage, setSuccessMessage] = useState("")
	const [password, setPassword] = useState(suggestedPassword)
	const formRef = useRef<HTMLFormElement>(null)
	const firstFieldRef = useRef<HTMLInputElement>(null)
	const createUser = useFetcher<typeof action>()
	const passwordSuggestion = useFetcher<{ password: string }>()
	const isSubmitting = createUser.state !== "idle"

	useEffect(() => {
		if (!isModalOpen) return
		firstFieldRef.current?.focus()
	}, [isModalOpen])

	useEffect(() => {
		if (!passwordSuggestion.data?.password) return
		setPassword(passwordSuggestion.data.password)
	}, [passwordSuggestion.data])

	useEffect(() => {
		if (!createUser.data?.ok) return
		setSuccessMessage(createUser.data.successMessage)
		setIsModalOpen(false)
		formRef.current?.reset()
		createUser.reset()
	}, [createUser.data, createUser.reset])

	useEffect(() => {
		if (!successMessage) return
		const timeout = window.setTimeout(() => setSuccessMessage(""), 4000)
		return () => window.clearTimeout(timeout)
	}, [successMessage])

	useEffect(() => {
		if (!isModalOpen || isSubmitting) return
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return
			createUser.reset()
			passwordSuggestion.reset()
			setIsModalOpen(false)
		}
		window.addEventListener("keydown", closeOnEscape)
		return () => window.removeEventListener("keydown", closeOnEscape)
	}, [isModalOpen, isSubmitting, createUser.reset, passwordSuggestion.reset])

	function openModal() {
		createUser.reset()
		passwordSuggestion.reset()
		setPassword(suggestedPassword)
		setIsModalOpen(true)
	}

	function closeModal() {
		if (isSubmitting) return
		createUser.reset()
		passwordSuggestion.reset()
		setIsModalOpen(false)
	}

	function requestPasswordSuggestion() {
		passwordSuggestion.load("/users/password-suggestion")
	}

	return (
		<>
			<div className="border-base-300 border-b px-5 pt-5">
				<div className="flex min-h-12 items-center justify-between gap-4">
					<h2 className="text-lg font-semibold">
						Usuarios registrados
					</h2>
					{activeTab === "users" ? (
						<button
							type="button"
							className="btn btn-primary"
							onClick={openModal}
						>
							Nuevo encargado
						</button>
					) : null}
				</div>

				<nav
					className="tabs tabs-border mt-5"
					aria-label="Tipos de usuario"
				>
					<Link
						to="#users"
						preventScrollReset
						className={`tab ${activeTab === "users" ? "tab-active" : ""}`}
					>
						Encargados
						<span className="ml-2 badge badge-sm badge-ghost">
							{regularUsersCount}
						</span>
					</Link>
					<Link
						to="#admins"
						preventScrollReset
						className={`tab ${activeTab === "admins" ? "tab-active" : ""}`}
					>
						Administradores
						<span className="ml-2 badge badge-sm badge-ghost">
							{adminUsersCount}
						</span>
					</Link>
				</nav>
			</div>

			{isModalOpen ? (
				<div
					className="modal modal-open bg-neutral/50"
					role="dialog"
					aria-modal="true"
					aria-labelledby="create-user-title"
				>
					<button
						type="button"
						className="modal-backdrop"
						onClick={closeModal}
						disabled={isSubmitting}
						aria-label="Cerrar modal"
					/>
					<section className="modal-box">
						<div className="flex items-start justify-between gap-4">
							<h2
								id="create-user-title"
								className="text-lg font-semibold"
							>
								Nuevo usuario
							</h2>
							<button
								type="button"
								className="btn btn-ghost btn-sm"
								onClick={closeModal}
								disabled={isSubmitting}
							>
								Cerrar
							</button>
						</div>

						<createUser.Form
							ref={formRef}
							method="post"
							autoComplete="off"
							className="mt-5 flex flex-col gap-4"
						>
							{createUser.data?.ok === false ? (
								<div
									className="alert alert-error alert-soft"
									role="alert"
								>
									{createUser.data.errorMessage}
								</div>
							) : null}

							<FormField
								label="Nombres"
								name="firstName"
								inputRef={firstFieldRef}
							/>
							<FormField
								label="Apellido paterno"
								name="paternalLastName"
							/>
							<FormField
								label="Apellido materno"
								name="maternalLastName"
							/>
							<FormField
								label="Teléfono"
								name="phoneNumber"
								type="tel"
							/>
							<FormField
								label="Correo"
								name="email"
								type="email"
								optional
							/>

							<label className="form-control">
								<span className="label-text mb-2 font-semibold">
									Contraseña temporal
								</span>
								<div className="flex gap-2">
									<input
										className="input input-bordered min-w-0 flex-1"
										autoComplete="off"
										type="text"
										name="password"
										value={password}
										onChange={(event) =>
											setPassword(event.target.value)
										}
										required
									/>
									<button
										type="button"
										className="btn btn-outline"
										onClick={requestPasswordSuggestion}
										disabled={
											passwordSuggestion.state !==
												"idle" || isSubmitting
										}
									>
										{passwordSuggestion.state === "idle"
											? "Sugerir"
											: "Generando..."}
									</button>
								</div>
							</label>

							<div className="flex justify-end gap-3 pt-2">
								<button
									type="button"
									className="btn btn-ghost"
									onClick={closeModal}
									disabled={isSubmitting}
								>
									Cancelar
								</button>
								<button
									type="submit"
									className="btn btn-primary"
									disabled={isSubmitting}
								>
									{isSubmitting
										? "Guardando..."
										: "Crear usuario"}
								</button>
							</div>
						</createUser.Form>
					</section>
				</div>
			) : null}

			{successMessage ? (
				<div className="toast toast-end z-50">
					<div className="alert alert-success" role="status">
						<span>{successMessage}</span>
						<button
							type="button"
							className="btn btn-ghost btn-xs"
							onClick={() => setSuccessMessage("")}
						>
							Cerrar
						</button>
					</div>
				</div>
			) : null}
		</>
	)
}

type FormFieldProps = {
	label: string
	name: string
	type?: "text" | "tel" | "email"
	optional?: boolean
	inputRef?: RefObject<HTMLInputElement | null>
}

function FormField({
	label,
	name,
	type = "text",
	optional = false,
	inputRef,
}: FormFieldProps) {
	return (
		<label className="form-control">
			<span className="label-text mb-2 flex items-center justify-between gap-3 font-semibold">
				{label}
				{optional ? (
					<span className="text-xs font-medium text-base-content/50">
						Opcional
					</span>
				) : null}
			</span>
			<input
				ref={inputRef}
				className="input input-bordered w-full"
				autoComplete="off"
				type={type}
				name={name}
				required={!optional}
			/>
		</label>
	)
}
