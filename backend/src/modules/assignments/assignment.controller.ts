import type { Request, Response } from "express"
// import { AssignmentError } from "./assignment.errors"
// import { } from 'assignment.service'
// import type { } from './assignment.types'

// ==========================================
// PAGE & PARTIAL RENDERERS
// ==========================================

export function renderAssignmentPage(_: Request, res: Response) {
	res.render("admin/assignments", { pageTitle: "Asignaciones" })
}
