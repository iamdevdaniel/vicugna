import type { Request, Response } from "express"
import { MonitoringError } from "./monitoring.errors"
import { getMonitoringPageState, reopenPermit } from "./monitoring.service"
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
			success?: string
			error?: string
		}
	>,
	res: Response,
) {
	const errorMessage = getQueryValue(req.query.error)
	const successMessage = getQueryValue(req.query.success)

	res.render(
		"admin/monitoring",
		getMonitoringViewData(
			req,
			await getMonitoringPageState(
				getSelectedSeasonId(req.query.seasonId),
				getQueryValue(req.query.permitId),
			),
			errorMessage || successMessage || null,
			errorMessage ? "error" : successMessage ? "success" : null,
		),
	)
}

export async function submitPermitReopen(
	req: Request<
		Record<string, never>,
		Record<string, never>,
		Record<string, unknown>
	>,
	res: Response,
) {
	const permitId = getBodyValue(req.body.permitId)
	const seasonId = getBodyValue(req.body.seasonId)

	try {
		await reopenPermit(permitId)
		res.redirect(
			getMonitoringPageUrl(
				seasonId,
				permitId,
				"success",
				"Permiso reabierto",
			),
		)
	} catch (error) {
		res.redirect(
			getMonitoringPageUrl(
				seasonId,
				permitId,
				"error",
				getMonitoringErrorMessage(error),
			),
		)
	}
}

function getBodyValue(value: unknown): string {
	return typeof value === "string" ? value.trim() : ""
}

function getMonitoringViewData(
	req: Request,
	data: Omit<
		MonitoringPageData,
		"pageTitle" | "adminUser" | "formMessage" | "formMessageType"
	>,
	formMessage: string | null,
	formMessageType: MonitoringPageData["formMessageType"],
): MonitoringPageData {
	return {
		pageTitle: "Seguimiento",
		adminUser: {
			fullName: req.session.adminUser?.fullName ?? "",
		},
		formMessage,
		formMessageType,
		...data,
	}
}

function getMonitoringErrorMessage(error: unknown): string {
	return error instanceof MonitoringError
		? error.message
		: "No se pudo reabrir el permiso"
}

function getMonitoringPageUrl(
	seasonId: string,
	permitId: string,
	messageType: "success" | "error",
	message: string,
): string {
	const searchParams = new URLSearchParams({
		seasonId,
		permitId,
		[messageType]: message,
	})

	return `/admin/monitoring?${searchParams.toString()}`
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
