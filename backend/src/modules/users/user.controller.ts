import type { Request, Response } from "express"

import { UserManagementError } from "./user.errors"
import { getUsersPageState, registerUser } from "./user.service"
import type { CreateUserFormData, UsersPageData } from "./user.types"

export async function renderUsersPage(req: Request, res: Response) {
	res.render("admin/users", getUsersViewData(req, await getUsersPageState()))
}

export async function createManagedUser(
	req: Request<
		Record<string, never>,
		Record<string, never>,
		CreateUserFormData
	>,
	res: Response,
) {
	try {
		await registerUser(req.body)
		res.render("partials/users-list", {
			...(await getUsersPageState()),
			successMessage: "Usuario creado",
			errorMessage: null,
		})
	} catch (error) {
		console.error(error)
		res.status(400).render("partials/users-list", {
			...(await getUsersPageState()),
			successMessage: null,
			errorMessage: getUserErrorMessage(error),
		})
	}
}

function getUsersViewData(
	req: Request,
	data: Omit<UsersPageData, "pageTitle" | "adminUser">,
): UsersPageData {
	return {
		pageTitle: "Usuarios",
		adminUser: {
			fullName: req.session.adminUser?.fullName ?? "",
		},
		...data,
	}
}

function getUserErrorMessage(error: unknown) {
	if (error instanceof UserManagementError) {
		return error.message
	}

	return "No se pudo crear el usuario"
}
