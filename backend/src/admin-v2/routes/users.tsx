import { data, useLoaderData } from "react-router"
import { UserManagementError } from "../../modules/users/user.errors"
import {
	getUsersPageState,
	registerUser,
} from "../../modules/users/user.service"
import { requireAdminSession } from "../admin-auth.server"
import type { UsersActionData } from "../screens/users/users-types"
import { UsersView } from "../screens/users/users-view"
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
		return data<UsersActionData>(
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

		return data<UsersActionData>(
			{ ok: true as const, successMessage: "Usuario creado" },
			{ status: 201 },
		)
	} catch (error) {
		const isManagementError = error instanceof UserManagementError

		if (!isManagementError) {
			console.error("Admin v2 user creation failed", error)
		}

		return data<UsersActionData>(
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
	return <UsersView {...useLoaderData<typeof loader>()} />
}
