import type { Request, Response } from "express"
import { getMonitoringPageState } from "./monitoring.service"
import type { MonitoringPageData } from "./monitoring.types"

// ==========================================
// PAGE & PARTIAL RENDERERS
// ==========================================

export async function renderMonitoringPage(
	req: Request<
		Record<string, never>,
		Record<string, never>,
		Record<string, never>,
		{
			seasonId?: string
			permitId?: string
		}
	>,
	res: Response,
) {
	res.render(
		"admin/monitoring",
		getMonitoringViewData(
			req,
			await getMonitoringPageState(
				getSelectedSeasonId(req.query.seasonId),
				getQueryValue(req.query.permitId),
			),
		),
	)
}

function getMonitoringViewData(
	req: Request,
	data: Omit<MonitoringPageData, "pageTitle" | "adminUser">,
): MonitoringPageData {
	return {
		pageTitle: "Seguimiento",
		adminUser: {
			fullName: req.session.adminUser?.fullName ?? "",
		},
		...data,
	}
}

function getSelectedSeasonId(seasonId: unknown) {
	if (Array.isArray(seasonId)) {
		const firstSeasonId = seasonId[0]

		return typeof firstSeasonId === "string" ? firstSeasonId.trim() : ""
	}

	return typeof seasonId === "string" ? seasonId.trim() : ""
}

function getQueryValue(value: unknown) {
	if (Array.isArray(value)) {
		const firstValue = value[0]

		return typeof firstValue === "string" ? firstValue.trim() : ""
	}

	return typeof value === "string" ? value.trim() : ""
}
