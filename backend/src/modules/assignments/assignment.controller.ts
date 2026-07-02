import type { Request, Response } from "express"
import { AssignmentManagementError } from "./assignment.errors"
import { createAssignment, getAssignmentsPageState } from "./assignment.service"
import type {
	AssignmentPageData,
	CreateAssignmentFormRequestBody,
} from "./assignment.types"

// ==========================================
// PAGE & PARTIAL RENDERERS
// ==========================================

export async function renderAssignmentPage(req: Request, res: Response) {
	res.render(
		"admin/assignments",
		getAssignmentsViewData(req, await getAssignmentsPageState(), null),
	)
}

function getAssignmentsViewData(
	req: Request,
	data: Omit<AssignmentPageData, "pageTitle" | "adminUser" | "formMessage">,
	formMessage: string | null,
): AssignmentPageData {
	return {
		pageTitle: "Asignaciones",
		adminUser: {
			fullName: req.session.adminUser?.fullName ?? "",
		},
		formMessage,
		...data,
	}
}

// ==========================================
// MUTATION HANDLERS
// ==========================================

export async function submitAssignmentForm(
	req: Request<
		Record<string, never>,
		Record<string, never>,
		CreateAssignmentFormRequestBody
	>,
	res: Response,
) {
	try {
		await createAssignment(req.body)
		res.render(
			"admin/assignments",
			getAssignmentsViewData(
				req,
				await getAssignmentsPageState(),
				"Asignacion guardada",
			),
		)
	} catch (error) {
		res.render(
			"admin/assignments",
			getAssignmentsViewData(
				req,
				await getAssignmentsPageState(),
				getAssignmentErrorMessage(error),
			),
		)
	}
}

function getAssignmentErrorMessage(error: unknown) {
	if (error instanceof AssignmentManagementError) {
		return error.message
	}

	return "No se pudo guardar la asignacion"
}
