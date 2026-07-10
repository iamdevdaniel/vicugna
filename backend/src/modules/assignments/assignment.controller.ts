import type { Request, Response } from "express"
import {
	getAssignmentsInitialPageState,
	getAssignmentsPageStateForSeason,
} from "./assignment.service"
import type { AssignmentPageData } from "./assignment.types"

export async function renderAssignmentPage(
	req: Request<
		Record<string, never>,
		Record<string, never>,
		Record<string, never>,
		{ seasonId?: string }
	>,
	res: Response,
) {
	const requestedSeasonId = getSelectedSeasonId(req.query.seasonId)
	const pageState = requestedSeasonId
		? await getAssignmentsPageStateForSeason(requestedSeasonId)
		: await getAssignmentsInitialPageState()

	res.render("admin/assignments", {
		pageTitle: "Asignaciones",
		adminUser: {
			fullName: req.session.adminUser?.fullName ?? "",
		},
		formMessage: null,
		...pageState,
	} satisfies AssignmentPageData)
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
