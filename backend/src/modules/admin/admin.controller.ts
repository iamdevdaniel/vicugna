import type { Request, Response } from "express"

import { AdminAuthError } from "./admin.errors"
import { authenticateAdmin } from "./admin.service"
import type { LoginFormData } from "./admin.types"

export function renderAdminLogin(req: Request, res: Response) {
	if (req.session.adminUser?.role === "admin") {
		res.redirect("/admin/mission-control")
		return
	}

	res.render("admin/login", {
		pageTitle: "Inicio de sesion",
		errorMessage: null,
		email: "",
	})
}

export async function loginAdmin(
	req: Request<Record<string, never>, Record<string, never>, LoginFormData>,
	res: Response,
) {
	try {
		const adminUser = await authenticateAdmin(req.body)
		req.session.adminUser = adminUser
		res.redirect("/admin/mission-control")
	} catch (error) {
		const errorMessage =
			error instanceof AdminAuthError
				? error.message
				: "No se pudo iniciar sesion en este momento"

		res.status(401).render("admin/login", {
			pageTitle: "Inicio de sesion",
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

export function renderMissionControl(req: Request, res: Response) {
	res.render("admin/mission-control", {
		pageTitle: "Panel de control",
		adminUser: req.session.adminUser,
		summary: {
			assignedPermits: 0,
			syncedPermits: 0,
			completedPermits: 0,
		},
		recentActivity: [],
	})
}
