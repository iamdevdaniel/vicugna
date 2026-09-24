import type { RefObject } from "react"
import type { UsersState } from "./users-state"

type UsersCreateModalProps = Pick<
	UsersState,
	| "createUser"
	| "passwordSuggestion"
	| "password"
	| "formRef"
	| "firstFieldRef"
	| "isSubmitting"
	| "closeModal"
	| "setPassword"
	| "requestPasswordSuggestion"
>

export function UsersCreateModal(props: UsersCreateModalProps) {
	const {
		createUser,
		passwordSuggestion,
		password,
		formRef,
		firstFieldRef,
		isSubmitting,
		closeModal,
		setPassword,
		requestPasswordSuggestion,
	} = props

	return (
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
					<FormField label="Teléfono" name="phoneNumber" type="tel" />
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
									passwordSuggestion.state !== "idle" ||
									isSubmitting
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
							{isSubmitting ? "Guardando..." : "Crear usuario"}
						</button>
					</div>
				</createUser.Form>
			</section>
		</div>
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
