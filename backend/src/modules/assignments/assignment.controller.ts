import type { Request, Response } from "express"
import { AssignmentManagementError } from "./assignment.errors"
import {
	createAssignment,
	getAssignmentsInitialPageState,
	getAssignmentsPageStateForSeason,
} from "./assignment.service"
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
		getAssignmentsViewData(
			req,
			await getAssignmentsInitialPageState(),
			null,
		),
	)
}

export async function renderAssignmentSeasonState(
	req: Request<
		Record<string, never>,
		Record<string, never>,
		{ seasonId?: string }
	>,
	res: Response,
) {
	const selectedSeasonId = getSelectedSeasonId(req.body.seasonId)
	const seasonState = await getAssignmentsPageStateForSeason(selectedSeasonId)
	res.render("partials/assignments-season-state", seasonState)
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
	const selectedSeasonId = getSelectedSeasonId(req.body.seasonId)

	try {
		await createAssignment(req.body)
		res.setHeader("HX-Trigger", "assignment-created")
		res.render("partials/assignments-create-result", {
			...(await getAssignmentsPageStateForSeason(selectedSeasonId)),
			errorMessage: null,
		})
	} catch (error) {
		res.render("partials/assignments-create-result", {
			...(await getAssignmentsPageStateForSeason(selectedSeasonId)),
			errorMessage: getAssignmentErrorMessage(error),
		})
	}
}

function getSelectedSeasonId(seasonId: unknown) {
	if (typeof seasonId !== "string") {
		return ""
	}

	const trimmedSeasonId = seasonId.trim()

	return trimmedSeasonId
}

function getAssignmentErrorMessage(error: unknown) {
	if (error instanceof AssignmentManagementError) {
		return error.message
	}

	return "No se pudo guardar la asignacion"
}
