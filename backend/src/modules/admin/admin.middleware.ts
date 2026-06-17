import type { NextFunction, Request, Response } from "express"

export function requireAdminSession(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	if (req.session.adminUser?.role === "admin") {
		next()
		return
	}

	res.redirect("/admin/login")
}
