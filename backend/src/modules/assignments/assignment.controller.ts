import type { Request, Response } from "express"
import { AssignmentManagementError } from "./assignment.errors"
import {
	createPermit,
	getAssignmentsInitialPageState,
	getAssignmentsPageStateForSeason,
	savePermitAssignments,
} from "./assignment.service"
import type {
	AssignmentPageData,
	CreatePermitFormData,
	PermitListItem,
	SavePermitAssignmentsFormData,
	SelectedPermitData,
} from "./assignment.types"

export async function renderAssignmentPage(
	req: Request<
		Record<string, never>,
		Record<string, never>,
		Record<string, never>,
		{
			seasonId?: string
			communityId?: string
			permitId?: string
			success?: string
			error?: string
		}
	>,
	res: Response,
) {
	const requestedSeasonId = getSelectedSeasonId(req.query.seasonId)
	const pageState = requestedSeasonId
		? await getAssignmentsPageStateForSeason(requestedSeasonId)
		: await getAssignmentsInitialPageState()
	const selectedPermit = getSelectedPermit(
		getQueryValue(req.query.permitId),
		requestedSeasonId || pageState.selectedSeasonId,
		pageState.permits,
	)
	const selectedCommunityId =
		selectedPermit?.communityId ||
		getQueryValue(req.query.communityId) ||
		pageState.selectedCommunityId
	const errorMessage = getQueryValue(req.query.error)
	const successMessage = getQueryValue(req.query.success)
	const formMessage = errorMessage || successMessage || null
	const formMessageType = errorMessage ? "error" : null

	res.render("admin/assignments", {
		pageTitle: "Asignaciones",
		adminUser: {
			fullName: req.session.adminUser?.fullName ?? "",
		},
		formMessage,
		formMessageType,
		...pageState,
		selectedCommunityId,
		selectedPermit,
	} satisfies AssignmentPageData)
}

export async function submitPermitForm(
	req: Request<
		Record<string, never>,
		Record<string, never>,
		CreatePermitFormData
	>,
	res: Response,
) {
	const seasonId = getSelectedSeasonId(req.body.seasonId)
	const communityId = req.body.communityId?.trim() ?? ""

	try {
		const { permitId } = await createPermit(req.body)

		res.redirect(
			getAssignmentPageUrl({
				seasonId,
				communityId,
				permitId,
				success: "Permiso creado",
			}),
		)
	} catch (error) {
		res.redirect(
			getAssignmentPageUrl({
				seasonId,
				communityId,
				error: getAssignmentErrorMessage(error),
			}),
		)
	}
}

export async function submitAssignmentForm(
	req: Request<
		Record<string, never>,
		Record<string, never>,
		SavePermitAssignmentsFormData
	>,
	res: Response,
) {
	const seasonId = getSelectedSeasonId(req.body.seasonId)
	const communityId = req.body.communityId?.trim() ?? ""
	const permitId = req.body.permitId?.trim() ?? ""

	try {
		await savePermitAssignments(req.body)

		res.redirect(
			getAssignmentPageUrl({
				seasonId,
				communityId,
				permitId,
				success: "Asignaciones guardadas",
			}),
		)
	} catch (error) {
		res.redirect(
			getAssignmentPageUrl({
				seasonId,
				communityId,
				permitId,
				error: getAssignmentErrorMessage(error),
			}),
		)
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

	return seasonId.trim()
}

function getQueryValue(value: unknown) {
	if (Array.isArray(value)) {
		const firstValue = value[0]

		return typeof firstValue === "string" ? firstValue.trim() : ""
	}

	return typeof value === "string" ? value.trim() : ""
}

function getAssignmentErrorMessage(error: unknown) {
	if (error instanceof AssignmentManagementError) {
		return error.message
	}

	return "No se pudo guardar la asignacion"
}

function getSelectedPermit(
	permitId: string,
	seasonId: string,
	permits: PermitListItem[],
): SelectedPermitData | null {
	if (!permitId) {
		return null
	}

	const permit = permits.find(
		(currentPermit) => currentPermit.id === permitId,
	)

	if (!permit) {
		return null
	}

	return {
		id: permit.id,
		seasonId,
		communityId: permit.communityId,
		permitNumber: permit.permitNumber,
	}
}

function getAssignmentPageUrl({
	seasonId,
	communityId,
	permitId,
	success,
	error,
}: {
	seasonId: string
	communityId?: string
	permitId?: string
	success?: string
	error?: string
}) {
	const searchParams = new URLSearchParams()

	if (seasonId) {
		searchParams.set("seasonId", seasonId)
	}

	if (communityId) {
		searchParams.set("communityId", communityId)
	}

	if (permitId) {
		searchParams.set("permitId", permitId)
	}

	if (success) {
		searchParams.set("success", success)
	}

	if (error) {
		searchParams.set("error", error)
	}

	const queryString = searchParams.toString()

	return queryString
		? `/admin/assignments?${queryString}`
		: "/admin/assignments"
}
