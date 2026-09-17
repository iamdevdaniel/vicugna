import { useState } from "react"
import { data, Form, redirect, useActionData } from "react-router"
import { adminSessionContext } from "../../admin-v2-context.server"
import { AdminAuthError } from "../../modules/admin/admin.errors"
import { authenticateAdmin } from "../../modules/admin/admin.service"
import type { Route } from "./+types/login"

export function meta() {
	return [{ title: "Inicio de sesión | Vicugna" }]
}

export function loader({ context }: Route.LoaderArgs) {
	const session = context.get(adminSessionContext)

	if (session.adminUser?.role === "admin") {
		return redirect("/")
	}

	return null
}

export async function action({ request, context }: Route.ActionArgs) {
	let formData: FormData

	try {
		formData = await request.formData()
	} catch {
		return data(
			{
				email: "",
				errorMessage: "El formulario enviado no es válido",
			},
			{ status: 400 },
		)
	}

	const emailValue = formData.get("email")
	const passwordValue = formData.get("password")
	const email = typeof emailValue === "string" ? emailValue : ""
	const password = typeof passwordValue === "string" ? passwordValue : ""

	try {
		const adminUser = await authenticateAdmin({ email, password })
		const session = context.get(adminSessionContext)
		session.adminUser = adminUser
		return redirect("/")
	} catch (error) {
		const isAuthenticationError = error instanceof AdminAuthError

		if (!isAuthenticationError) {
			console.error("Admin v2 login failed", error)
		}

		return data(
			{
				email,
				errorMessage: isAuthenticationError
					? error.message
					: "No se pudo iniciar sesión en este momento",
			},
			{ status: isAuthenticationError ? 401 : 500 },
		)
	}
}

export default function LoginPage() {
	const actionData = useActionData<typeof action>()
	const [showPassword, setShowPassword] = useState(false)

	return (
		<main className="grid min-h-screen md:grid-cols-[minmax(0,1.15fr)_minmax(24rem,.85fr)]">
			<section className="relative min-h-52 overflow-hidden md:min-h-screen">
				<img
					src="/hero.webp"
					alt="Vicuñas en su entorno natural"
					className="absolute inset-0 h-full w-full object-cover"
				/>
				<div className="absolute inset-0 bg-linear-to-t from-neutral/80 via-neutral/20 to-transparent" />
				<div className="absolute inset-x-0 bottom-0 p-6 text-neutral-content lg:p-16">
					<p className="text-xs font-bold uppercase tracking-[.3em] text-accent">
						ANMVB
					</p>
					<h1 className="mt-2 text-4xl font-semibold lg:text-5xl">
						vicugna app
					</h1>
				</div>
			</section>

			<section className="flex items-center justify-center bg-base-100 px-6 py-10 sm:px-12">
				<div className="w-full max-w-sm">
					<a
						href="/"
						className="mb-4 inline-flex text-sm font-semibold text-primary hover:text-primary/75"
					>
						← Volver al inicio
					</a>
					<p className="text-xs font-bold uppercase tracking-wide text-base-content/60">
						Acceso administrativo
					</p>
					<h2 className="mt-2 text-3xl font-semibold">
						Inicio de sesión
					</h2>
					<p className="mt-2 text-sm text-base-content/65">
						Gestión de asignaciones y seguimiento de permisos.
					</p>

					<Form
						method="post"
						reloadDocument
						className="mt-6 flex flex-col gap-4"
					>
						{actionData?.errorMessage ? (
							<div className="alert alert-error alert-soft">
								{actionData.errorMessage}
							</div>
						) : null}

						<label className="form-control">
							<span className="label-text mb-2 font-semibold">
								Correo
							</span>
							<input
								className="input input-bordered w-full"
								type="email"
								name="email"
								defaultValue={actionData?.email ?? ""}
								placeholder="correo@ejemplo.com"
								autoComplete="username"
							/>
						</label>

						<label className="form-control">
							<span className="label-text mb-2 font-semibold">
								Contraseña
							</span>
							<div className="relative">
								<input
									className="input input-bordered w-full pr-24"
									type={showPassword ? "text" : "password"}
									name="password"
									placeholder="********"
									autoComplete="current-password"
								/>
								<button
									type="button"
									className="btn btn-ghost btn-sm absolute top-1/2 right-1 -translate-y-1/2"
									onClick={() =>
										setShowPassword((visible) => !visible)
									}
								>
									{showPassword ? "Ocultar" : "Mostrar"}
								</button>
							</div>
						</label>

						<button
							type="submit"
							className="btn btn-primary mt-1 w-full"
						>
							Entrar
						</button>
					</Form>
				</div>
			</section>
		</main>
	)
}
