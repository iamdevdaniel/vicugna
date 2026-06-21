import type { Request, Response } from "express"

import { UserManagementError } from "./user.errors"
import {
	getSuggestedTemporaryPassword,
	getUsersPageState,
	registerUser,
} from "./user.service"
import type { CreateUserFormData, UsersPageData } from "./user.types"

// ==========================================
// PAGE & PARTIAL RENDERERS
// ==========================================

export async function renderUsersPage(req: Request, res: Response) {
	res.render("admin/users", getUsersViewData(req, await getUsersPageState()))
}

export function renderPasswordSuggestion(_req: Request, res: Response) {
	res.render("partials/users-password-field", {
		suggestedPassword: getSuggestedTemporaryPassword(),
	})
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

// ==========================================
// MUTATION HANDLERS
// ==========================================

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
		res.setHeader("HX-Trigger", "user-created")
		res.render("partials/users-create-result", {
			...(await getUsersPageState()),
			successMessage: "Usuario creado",
			errorMessage: null,
		})
	} catch (error) {
		res.render("partials/users-create-result", {
			...(await getUsersPageState()),
			successMessage: null,
			errorMessage: getUserErrorMessage(error),
		})
	}
}

function getUserErrorMessage(error: unknown) {
	if (error instanceof UserManagementError) {
		return error.message
	}

	return "No se pudo crear el usuario"
}
