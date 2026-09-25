import { data, redirect, useActionData } from "react-router"
import { adminSessionContext } from "../../admin-context.server"
import { AdminAuthError } from "../../modules/admin/admin.errors"
import { authenticateAdmin } from "../../modules/admin/admin.service"
import { LoginView } from "../screens/login/login-view"
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
			console.error("Admin login failed", error)
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
	return <LoginView actionData={actionData} />
}
