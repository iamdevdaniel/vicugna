import {
	getPostgresConstraintName,
	POSTGRES_ERROR_CODES,
} from "../../db/errors"
import { AssignmentManagementError } from "./assignment.errors"
import {
	createAssignment as createAssignmentRecord,
	createPermit as createPermitRecord,
	deleteAssignment as deleteAssignmentRecord,
	findAssignmentById,
	findFirstAssignmentByPermit,
	findPermitById,
	findPermitBySeasonAndNumber,
	listAssignments,
	listAssignmentUsers,
	listCommunities,
	listEligibleAssignmentUsersByPermit,
	listPermitsBySeason,
	listSeasons,
	setActiveAssignment as setActiveAssignmentRecord,
} from "./assignment.repository"
import type {
	AssignmentMutationRequestBody,
	AssignmentPageData,
	AssignmentPermitCard,
	CreateAssignmentData,
	CreatePermitFormData,
} from "./assignment.types"

// Keep the assignment rules in one file for now so this feature stays easier
// to read and change while the flow is still being defined.

// ==========================================
// PAGE DATA
// ==========================================

export async function getAssignmentsInitialPageState(): Promise<
	Omit<AssignmentPageData, "pageTitle" | "adminUser" | "formMessage">
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
	Omit<AssignmentPageData, "pageTitle" | "adminUser" | "formMessage">
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

	if (!formData.seasonId || !formData.permitNumber) {
		throw new AssignmentManagementError(
			"Temporada y permiso son obligatorios",
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
			formData.permitNumber,
		),
	}
}

export async function createAssignment(data: CreateAssignmentData) {
	const formData = normalizeCreateAssignmentForm(data)

	if (
		!formData.seasonId ||
		!formData.communityId ||
		!formData.userId ||
		!formData.permitId
	) {
		throw new AssignmentManagementError(
			"Temporada, comunidad, encargado y permiso son obligatorios",
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

	const existingAssignment = await findFirstAssignmentByPermit(
		formData.permitId,
	)

	if (
		existingAssignment &&
		existingAssignment.communityId !== formData.communityId
	) {
		throw new AssignmentManagementError(
			"Ese permiso ya fue fijado a otra comunidad",
		)
	}

	try {
		await createAssignmentRecord(formData)
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
		permitNumber: data.permitNumber.trim(),
	}
}

function normalizeCreateAssignmentForm(
	data: CreateAssignmentData,
): CreateAssignmentData {
	return {
		seasonId: data.seasonId.trim(),
		communityId: data.communityId.trim(),
		userId: data.userId.trim(),
		permitId: data.permitId.trim(),
	}
}

function normalizeAssignmentMutationForm(
	data: AssignmentMutationRequestBody,
): AssignmentMutationRequestBody {
	return {
		seasonId: data.seasonId.trim(),
		permitId: data.permitId.trim(),
		assignmentId: data.assignmentId.trim(),
	}
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
