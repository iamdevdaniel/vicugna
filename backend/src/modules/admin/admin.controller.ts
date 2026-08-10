import type { Request, Response } from "express"

import { AdminAuthError } from "./admin.errors"
import { authenticateAdmin } from "./admin.service"
import type { LoginFormData } from "./admin.types"

// ==========================================
// PAGE & PARTIAL RENDERERS
// ==========================================

export function renderAdminLogin(req: Request, res: Response) {
	if (req.session.adminUser?.role === "admin") {
		res.redirect("/admin/mission-control")
		return
	}

	res.render("admin/login", {
		pageTitle: "Inicio de sesión",
		errorMessage: null,
		email: "",
	})
}

export function renderMissionControl(req: Request, res: Response) {
	res.render("admin/mission-control", {
		pageTitle: "Inicio",
		adminUser: req.session.adminUser,
	})
}

// ==========================================
// MUTATION HANDLERS
// ==========================================

export async function loginAdmin(
	req: Request<Record<string, never>, Record<string, never>, LoginFormData>,
	res: Response,
) {
	try {
		const adminUser = await authenticateAdmin(req.body)
		req.session.adminUser = adminUser
		res.redirect("/admin/mission-control")
	} catch (error) {
		const isAuthenticationError = error instanceof AdminAuthError

		if (!isAuthenticationError) {
			console.error("Admin login failed", error)
		}

		const errorMessage = isAuthenticationError
			? error.message
			: "No se pudo iniciar sesión en este momento"

		res.status(isAuthenticationError ? 401 : 500).render("admin/login", {
			pageTitle: "Inicio de sesión",
			errorMessage,
			email: req.body.email ?? "",
		})
	}
}

export function logoutAdmin(req: Request, res: Response) {
	req.session.destroy(() => {
		res.redirect("/admin/login")
	})
}
