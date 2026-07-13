import {
	getPostgresConstraintName,
	POSTGRES_ERROR_CODES,
} from "../../db/errors"
import { AssignmentManagementError } from "./assignment.errors"
import {
	createPermit as createPermitRecord,
	deleteAssignment as deleteAssignmentRecord,
	findAssignmentById,
	findPermitById,
	findPermitBySeasonAndNumber,
	listAssignments,
	listAssignmentUsers,
	listCommunities,
	listEligibleAssignmentUsersByPermit,
	listPermitsBySeason,
	listSeasons,
	replaceAssignmentsForPermit as replaceAssignmentsForPermitRecord,
	setActiveAssignment as setActiveAssignmentRecord,
	updatePermitNumber as updatePermitNumberRecord,
} from "./assignment.repository"
import type {
	AssignmentMutationRequestBody,
	AssignmentPageData,
	AssignmentPermitCard,
	CreatePermitFormData,
	RenamePermitFormData,
	SavePermitAssignmentsFormData,
} from "./assignment.types"

// Keep the assignment rules in one file for now so this feature stays easier
// to read and change while the flow is still being defined.

// ==========================================
// PAGE DATA
// ==========================================

export async function getAssignmentsInitialPageState(): Promise<
	Omit<
		AssignmentPageData,
		"pageTitle" | "adminUser" | "formMessage" | "formMessageType"
	>
> {
	const [seasons, communities] = await Promise.all([
		listSeasons(),
		listCommunities(),
	])

	const selectedSeasonId = seasons[0]?.id ?? ""
	const [permits, users, assignments] = await Promise.all([
		selectedSeasonId ? listPermitsBySeason(selectedSeasonId) : [],
		selectedSeasonId ? listAssignmentUsers() : [],
		selectedSeasonId ? listAssignments(selectedSeasonId) : [],
	])

	return {
		selectedSeasonId,
		selectedCommunityId: "",
		selectedPermit: null,
		seasons,
		permits,
		communities,
		users,
		assignments,
		assignmentCards: buildAssignmentCards(assignments),
	}
}

export async function getAssignmentsPageStateForSeason(
	selectedSeasonId: string,
): Promise<
	Omit<
		AssignmentPageData,
		"pageTitle" | "adminUser" | "formMessage" | "formMessageType"
	>
> {
	const [seasons, permits, communities, users, assignments] =
		await Promise.all([
			listSeasons(),
			selectedSeasonId ? listPermitsBySeason(selectedSeasonId) : [],
			listCommunities(),
			selectedSeasonId ? listAssignmentUsers() : [],
			selectedSeasonId ? listAssignments(selectedSeasonId) : [],
		])

	return {
		selectedSeasonId,
		selectedCommunityId: "",
		selectedPermit: null,
		seasons,
		permits,
		communities,
		users,
		assignments,
		assignmentCards: buildAssignmentCards(assignments),
	}
}

export async function getEligibleAssignmentUsersForPermit(permitId: string) {
	return listEligibleAssignmentUsersByPermit(permitId)
}

// ==========================================
// PERMIT CREATION FLOW
// ==========================================

export async function createPermit(data: CreatePermitFormData) {
	const formData = normalizePermitForm(data)

	if (!formData.seasonId || !formData.communityId || !formData.permitNumber) {
		throw new AssignmentManagementError(
			"Temporada, comunidad y permiso son obligatorios",
		)
	}

	const existingPermit = await findPermitBySeasonAndNumber(
		formData.seasonId,
		formData.permitNumber,
	)

	if (existingPermit) {
		throw new AssignmentManagementError("Ese permiso ya existe")
	}

	return {
		permitId: await createPermitRecord(
			formData.seasonId,
			formData.communityId,
			formData.permitNumber,
		),
	}
}

export async function renamePermit(data: RenamePermitFormData) {
	const formData = normalizeRenamePermitForm(data)

	if (!formData.seasonId || !formData.permitId || !formData.permitNumber) {
		throw new AssignmentManagementError(
			"Temporada, permiso y nuevo nombre son obligatorios",
		)
	}

	const permit = await findPermitById(formData.permitId)

	if (!permit) {
		throw new AssignmentManagementError("Ese permiso ya no existe")
	}

	if (permit.seasonId !== formData.seasonId) {
		throw new AssignmentManagementError(
			"Ese permiso pertenece a otra temporada",
		)
	}

	if (permit.permitNumber === formData.permitNumber) {
		return
	}

	const existingPermit = await findPermitBySeasonAndNumber(
		formData.seasonId,
		formData.permitNumber,
	)

	if (existingPermit && existingPermit.id !== formData.permitId) {
		throw new AssignmentManagementError("Ese permiso ya existe")
	}

	await updatePermitNumberRecord(formData.permitId, formData.permitNumber)
}

export async function savePermitAssignments(
	data: SavePermitAssignmentsFormData,
) {
	const formData = normalizeSavePermitAssignmentsForm(data)

	if (!formData.seasonId || !formData.permitId) {
		throw new AssignmentManagementError(
			"Temporada y permiso son obligatorios",
		)
	}

	if (formData.userIds.length === 0) {
		throw new AssignmentManagementError(
			"El permiso debe tener al menos un encargado",
		)
	}

	const permit = await findPermitById(formData.permitId)

	if (!permit) {
		throw new AssignmentManagementError("Ese permiso ya no existe")
	}

	if (permit.seasonId !== formData.seasonId) {
		throw new AssignmentManagementError(
			"Ese permiso pertenece a otra temporada",
		)
	}

	if (new Set(formData.userIds).size !== formData.userIds.length) {
		throw new AssignmentManagementError("Hay encargados repetidos")
	}

	const activeUserId =
		formData.userIds.length === 0
			? null
			: formData.userIds.includes(formData.activeUserId)
				? formData.activeUserId
				: formData.userIds[0]

	try {
		await replaceAssignmentsForPermitRecord(
			formData.permitId,
			formData.userIds.map((userId, position) => ({
				seasonId: formData.seasonId,
				communityId: permit.communityId,
				userId,
				permitId: formData.permitId,
				position,
				active: activeUserId === userId,
			})),
		)
	} catch (error) {
		throwAssignmentCreationError(error)
	}
}

export async function setAssignmentAsActive(
	data: AssignmentMutationRequestBody,
) {
	const formData = normalizeAssignmentMutationForm(data)
	const assignment = await getAssignmentForMutation(formData)

	if (assignment.permitId !== formData.permitId) {
		throw new AssignmentManagementError(
			"Esa asignacion no pertenece al permiso seleccionado",
		)
	}

	await setActiveAssignmentRecord(formData.assignmentId, formData.permitId)
}

export async function removeAssignment(data: AssignmentMutationRequestBody) {
	const formData = normalizeAssignmentMutationForm(data)
	const assignment = await getAssignmentForMutation(formData)

	if (assignment.permitId !== formData.permitId) {
		throw new AssignmentManagementError(
			"Esa asignacion no pertenece al permiso seleccionado",
		)
	}

	await deleteAssignmentRecord(formData.assignmentId)
}

// ==========================================
// ASSIGNMENT FLOW
// ==========================================

function normalizePermitForm(data: CreatePermitFormData) {
	return {
		seasonId: data.seasonId.trim(),
		communityId: data.communityId.trim(),
		permitNumber: data.permitNumber.trim(),
	}
}

function normalizeSavePermitAssignmentsForm(
	data: SavePermitAssignmentsFormData,
) {
	return {
		seasonId: data.seasonId.trim(),
		communityId: data.communityId.trim(),
		permitId: data.permitId.trim(),
		activeUserId: data.activeUserId.trim(),
		userIds: normalizeUserIds(data.userIds),
	}
}

function normalizeRenamePermitForm(data: RenamePermitFormData) {
	return {
		seasonId: data.seasonId.trim(),
		communityId: data.communityId.trim(),
		permitId: data.permitId.trim(),
		permitNumber: data.permitNumber.trim(),
	}
}

function normalizeAssignmentMutationForm(
	data: AssignmentMutationRequestBody,
): AssignmentMutationRequestBody {
	return {
		seasonId: data.seasonId.trim(),
		communityId: data.communityId.trim(),
		permitId: data.permitId.trim(),
		assignmentId: data.assignmentId.trim(),
	}
}

function normalizeUserIds(userIds?: string | string[]) {
	if (!userIds) {
		return []
	}

	const rawValues = Array.isArray(userIds) ? userIds : [userIds]

	return rawValues.map((value) => value.trim()).filter(Boolean)
}

async function getAssignmentForMutation(data: AssignmentMutationRequestBody) {
	if (!data.seasonId || !data.permitId || !data.assignmentId) {
		throw new AssignmentManagementError("Faltan datos de la asignacion")
	}

	const assignment = await findAssignmentById(data.assignmentId)

	if (!assignment) {
		throw new AssignmentManagementError("Esa asignacion ya no existe")
	}

	if (assignment.seasonId !== data.seasonId) {
		throw new AssignmentManagementError(
			"Esa asignacion pertenece a otra temporada",
		)
	}

	return assignment
}

function throwAssignmentCreationError(error: unknown): never {
	const uniqueConstraint = getPostgresConstraintName(
		error,
		POSTGRES_ERROR_CODES.uniqueViolation,
	)

	if (
		uniqueConstraint === "assignments_season_community_user_permit_unique"
	) {
		throw new AssignmentManagementError("Esa asignacion ya existe")
	}

	if (uniqueConstraint === "assignments_active_permit_unique") {
		throw new AssignmentManagementError(
			"No se pudo definir el encargado principal del permiso",
		)
	}

	const foreignKeyConstraint = getPostgresConstraintName(
		error,
		POSTGRES_ERROR_CODES.foreignKeyViolation,
	)

	if (foreignKeyConstraint) {
		throw new AssignmentManagementError(
			"La temporada, comunidad o encargado ya no existe",
		)
	}

	throw error
}

function buildAssignmentCards(
	assignments: AssignmentPageData["assignments"],
): AssignmentPermitCard[] {
	const cardsByPermit = new Map<string, AssignmentPermitCard>()

	for (const assignment of assignments) {
		const existingCard = cardsByPermit.get(assignment.permitId)

		if (existingCard) {
			existingCard.users.push({
				assignmentId: assignment.id,
				userId: assignment.userId,
				userFullName: assignment.userFullName,
				active: assignment.active,
			})
			continue
		}

		cardsByPermit.set(assignment.permitId, {
			permitId: assignment.permitId,
			permitNumber: assignment.permitNumber,
			seasonName: assignment.seasonName,
			communityId: assignment.communityId,
			communityName: assignment.communityName,
			users: [
				{
					assignmentId: assignment.id,
					userId: assignment.userId,
					userFullName: assignment.userFullName,
					active: assignment.active,
				},
			],
		})
	}

	return Array.from(cardsByPermit.values())
}
