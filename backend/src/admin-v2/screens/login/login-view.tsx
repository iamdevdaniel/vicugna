import { Form } from "react-router"
import { useLoginState } from "./login-state"

type LoginViewProps = {
	actionData?: {
		email: string
		errorMessage: string
	}
}

export function LoginView({ actionData }: LoginViewProps) {
	const login = useLoginState()

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
									type={
										login.showPassword ? "text" : "password"
									}
									name="password"
									placeholder="********"
									autoComplete="current-password"
								/>
								<button
									type="button"
									className="btn btn-ghost btn-sm absolute top-1/2 right-1 -translate-y-1/2"
									onClick={login.togglePassword}
								>
									{login.showPassword ? "Ocultar" : "Mostrar"}
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
