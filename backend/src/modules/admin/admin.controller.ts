import type { Request, Response } from "express"

export function renderAdminLogin(_req: Request, res: Response) {
	res.render("admin/login", {
		pageTitle: "Admin Login",
	})
}

export function renderMissionControl(_req: Request, res: Response) {
	res.render("admin/mission-control", {
		pageTitle: "Mission Control",
		summary: {
			assignedPermits: 0,
			syncedPermits: 0,
			completedPermits: 0,
		},
		recentActivity: [],
	})
}
