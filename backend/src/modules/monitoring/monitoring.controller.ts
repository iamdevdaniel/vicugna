import type { Request, Response } from "express"
import { getMonitoringPageState } from "./monitoring.service"
import type { MonitoringPageData } from "./monitoring.types"

export async function renderMonitoringPage(req: Request, res: Response) {
	res.render(
		"admin/monitoring",
		getMonitoringViewData(req, await getMonitoringPageState()),
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
