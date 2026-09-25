import { data, useLoaderData } from "react-router"
import { AssignmentManagementError } from "../../modules/assignments/assignment.errors"
import {
	createPermit,
	getAssignmentsInitialPageState,
	getAssignmentsPageStateForSeason,
	renamePermit,
	savePermitAssignments,
} from "../../modules/assignments/assignment.service"
import { requireAdminSession } from "../admin-auth.server"
import type { AssignmentActionData } from "../screens/assignments/assignments-types"
import { AssignmentsView } from "../screens/assignments/assignments-view"
import type { Route } from "./+types/assignments"

export function meta() {
	return [{ title: "Asignaciones | Administración Vicugna" }]
}

export async function loader({ request, context }: Route.LoaderArgs) {
	requireAdminSession(context)

	const requestedSeasonId = new URL(request.url).searchParams
		.get("seasonId")
		?.trim()
	return requestedSeasonId
		? getAssignmentsPageStateForSeason(requestedSeasonId)
		: getAssignmentsInitialPageState()
}

export async function action({ request, context }: Route.ActionArgs) {
	requireAdminSession(context)

	let formData: FormData
	try {
		formData = await request.formData()
	} catch {
		return assignmentError("El formulario enviado no es válido")
	}

	const intent = getTextField(formData, "intent")

	try {
		switch (intent) {
			case "create-permit": {
				const { permitId } = await createPermit({
					seasonId: getTextField(formData, "seasonId"),
					communityId: getTextField(formData, "communityId"),
					permitNumber: getTextField(formData, "permitNumber"),
				})
				return data<AssignmentActionData>({
					ok: true,
					intent,
					message: "Permiso creado",
					permitId,
				})
			}
			case "rename-permit":
				await renamePermit({
					seasonId: getTextField(formData, "seasonId"),
					communityId: getTextField(formData, "communityId"),
					permitId: getTextField(formData, "permitId"),
					permitNumber: getTextField(formData, "permitNumber"),
				})
				return data<AssignmentActionData>({
					ok: true,
					intent,
					message: "Permiso actualizado",
				})
			case "save-assignments":
				await savePermitAssignments({
					seasonId: getTextField(formData, "seasonId"),
					communityId: getTextField(formData, "communityId"),
					permitId: getTextField(formData, "permitId"),
					activeUserId: getTextField(formData, "activeUserId"),
					userIds: getTextFields(formData, "userIds"),
				})
				return data<AssignmentActionData>({
					ok: true,
					intent,
					message: "Asignaciones guardadas",
				})
			default:
				return assignmentError("La operación solicitada no es válida")
		}
	} catch (error) {
		if (!(error instanceof AssignmentManagementError)) {
			console.error("Admin assignment mutation failed", error)
		}

		return assignmentError(
			error instanceof AssignmentManagementError
				? error.message
				: "No se pudo guardar el cambio",
			error instanceof AssignmentManagementError ? 400 : 500,
			intent,
		)
	}
}

function assignmentError(message: string, status = 400, intent = "") {
	return data<AssignmentActionData>(
		{ ok: false, intent, message },
		{ status },
	)
}

function getTextField(formData: FormData, name: string) {
	const value = formData.get(name)
	return typeof value === "string" ? value : ""
}

function getTextFields(formData: FormData, name: string) {
	return formData
		.getAll(name)
		.filter((value): value is string => typeof value === "string")
}

export default function AssignmentsPage() {
	const pageState = useLoaderData<typeof loader>()
	return <AssignmentsView {...pageState} />
}
