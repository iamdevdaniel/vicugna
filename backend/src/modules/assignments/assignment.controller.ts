import type { Request, Response } from "express"
import { AssignmentManagementError } from "./assignment.errors"
import {
	createAssignment,
	createPermit,
	getAssignmentsInitialPageState,
	getAssignmentsPageStateForSeason,
	removeAssignment,
	setAssignmentAsActive,
} from "./assignment.service"
import type {
	AssignmentMutationRequestBody,
	AssignmentPageData,
	CreateAssignmentFormRequestBody,
	CreatePermitFormData,
	SelectedPermitData,
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
		Record<string, never>,
		{ seasonId?: string }
	>,
	res: Response,
) {
	const selectedSeasonId = getSelectedSeasonId(req.query.seasonId)
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
		assignmentCards: data.assignmentCards ?? [],
	}
}

// ==========================================
// MUTATION HANDLERS
// ==========================================

export async function submitPermitForm(
	req: Request<
		Record<string, never>,
		Record<string, never>,
		CreatePermitFormData
	>,
	res: Response,
) {
	const selectedSeasonId = getSelectedSeasonId(req.body.seasonId)

	try {
		const { permitId } = await createPermit(req.body)
		await renderAssignmentMutationResult(res, {
			selectedSeasonId,
			selectedPermitId: permitId,
			successMessage: "Permiso creado",
		})
	} catch (error) {
		await renderAssignmentMutationResult(res, {
			selectedSeasonId,
			selectedPermitId: null,
			errorMessage: getAssignmentErrorMessage(error),
		})
	}
}

export async function submitAssignmentForm(
	req: Request<
		Record<string, never>,
		Record<string, never>,
		CreateAssignmentFormRequestBody
	>,
	res: Response,
) {
	const selectedSeasonId = getSelectedSeasonId(req.body.seasonId)
	const selectedPermit: SelectedPermitData = {
		id: req.body.permitId,
		seasonId: selectedSeasonId,
		permitNumber: req.body.permitNumber,
	}

	try {
		await createAssignment(req.body)
		res.setHeader("HX-Trigger", "assignment-created")
		await renderAssignmentMutationResult(res, {
			selectedSeasonId,
			selectedPermitId: selectedPermit.id,
			successMessage: "Asignacion guardada",
		})
	} catch (error) {
		await renderAssignmentMutationResult(res, {
			selectedSeasonId,
			selectedPermitId: selectedPermit.id,
			errorMessage: getAssignmentErrorMessage(error),
		})
	}
}

export async function activateAssignment(
	req: Request<
		Record<string, never>,
		Record<string, never>,
		AssignmentMutationRequestBody
	>,
	res: Response,
) {
	const selectedSeasonId = getSelectedSeasonId(req.body.seasonId)

	try {
		await setAssignmentAsActive(req.body)
		await renderAssignmentMutationResult(res, {
			selectedSeasonId,
			selectedPermitId: req.body.permitId,
			successMessage: "Encargado principal actualizado",
		})
	} catch (error) {
		await renderAssignmentMutationResult(res, {
			selectedSeasonId,
			selectedPermitId: req.body.permitId,
			errorMessage: getAssignmentErrorMessage(error),
		})
	}
}

export async function deleteAssignment(
	req: Request<
		Record<string, never>,
		Record<string, never>,
		AssignmentMutationRequestBody
	>,
	res: Response,
) {
	const selectedSeasonId = getSelectedSeasonId(req.body.seasonId)

	try {
		await removeAssignment(req.body)
		await renderAssignmentMutationResult(res, {
			selectedSeasonId,
			selectedPermitId: req.body.permitId,
			successMessage: "Asignacion eliminada",
		})
	} catch (error) {
		await renderAssignmentMutationResult(res, {
			selectedSeasonId,
			selectedPermitId: req.body.permitId,
			errorMessage: getAssignmentErrorMessage(error),
		})
	}
}

function getSelectedSeasonId(seasonId: unknown) {
	if (Array.isArray(seasonId)) {
		const firstSeasonId = seasonId[0]

		return typeof firstSeasonId === "string" ? firstSeasonId.trim() : ""
	}

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

async function renderAssignmentMutationResult(
	res: Response,
	{
		selectedSeasonId,
		selectedPermitId,
		errorMessage = null,
		successMessage = null,
	}: {
		selectedSeasonId: string
		selectedPermitId: string | null
		errorMessage?: string | null
		successMessage?: string | null
	},
) {
	const seasonState = await getAssignmentsPageStateForSeason(selectedSeasonId)

	res.render("partials/assignments-mutation-result", {
		...seasonState,
		selectedPermit: getSelectedPermitData(
			selectedSeasonId,
			selectedPermitId,
			seasonState.permits,
		),
		errorMessage,
		successMessage,
	})
}

function getSelectedPermitData(
	selectedSeasonId: string,
	permitId: string | null,
	permits: Array<{ id: string; permitNumber: string }>,
): SelectedPermitData | null {
	if (!permitId) {
		return null
	}

	const selectedPermit = permits.find((permit) => permit.id === permitId)

	if (!selectedPermit) {
		return null
	}

	return {
		id: selectedPermit.id,
		seasonId: selectedSeasonId,
		permitNumber: selectedPermit.permitNumber,
	}
}
