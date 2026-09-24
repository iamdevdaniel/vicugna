import { data, useActionData, useLoaderData } from "react-router"
import { MonitoringError } from "../../modules/monitoring/monitoring.errors"
import {
	getMonitoringPageState,
	reopenPermit,
} from "../../modules/monitoring/monitoring.service"
import { requireAdminSession } from "../admin-auth.server"
import type { MonitoringActionData } from "../screens/monitoring/monitoring-types"
import { MonitoringView } from "../screens/monitoring/monitoring-view"
import type { Route } from "./+types/monitoring"

export function meta() {
	return [{ title: "Seguimiento | Administración Vicugna" }]
}

export async function loader({ request, context }: Route.LoaderArgs) {
	requireAdminSession(context)
	const searchParams = new URL(request.url).searchParams

	return getMonitoringPageState(
		searchParams.get("seasonId")?.trim(),
		searchParams.get("permitId")?.trim(),
	)
}

export async function action({ request, context }: Route.ActionArgs) {
	requireAdminSession(context)

	let formData: FormData
	try {
		formData = await request.formData()
	} catch {
		return monitoringError("El formulario enviado no es válido")
	}

	if (getTextField(formData, "intent") !== "reopen-permit") {
		return monitoringError("La operación solicitada no es válida")
	}

	try {
		await reopenPermit(getTextField(formData, "permitId"))
		return data<MonitoringActionData>({
			ok: true,
			message: "Permiso reabierto",
		})
	} catch (error) {
		if (!(error instanceof MonitoringError)) {
			console.error("Admin v2 permit reopen failed", error)
		}
		return monitoringError(
			error instanceof MonitoringError
				? error.message
				: "No se pudo reabrir el permiso",
			error instanceof MonitoringError ? 400 : 500,
		)
	}
}

function monitoringError(message: string, status = 400) {
	return data<MonitoringActionData>({ ok: false, message }, { status })
}

function getTextField(formData: FormData, name: string) {
	const value = formData.get(name)
	return typeof value === "string" ? value.trim() : ""
}

export default function MonitoringPage() {
	const pageData = useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()
	return (
		<MonitoringView
			key={pageData.selectedSeasonId}
			pageData={pageData}
			actionData={actionData}
		/>
	)
}
