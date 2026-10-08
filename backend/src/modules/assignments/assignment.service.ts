import {
	getPostgresConstraintName,
	POSTGRES_ERROR_CODES,
} from "../../db/errors"
import { listSeasons } from "../common/common.repository"
import { AssignmentManagementError } from "./assignment.errors"
import {
	createPermit as createPermitRecord,
	findPermitById,
	findPermitBySeasonAndNumber,
	listAssignments,
	listAssignmentUsers,
	listCommunities,
	listPermitsBySeason,
	saveAssignmentForPermit as saveAssignmentForPermitRecord,
	updatePermitNumber as updatePermitNumberRecord,
} from "./assignment.repository"
import type {
	AssignmentPageState,
	AssignmentPermitCard,
	CreatePermitFormData,
	RenamePermitFormData,
	SavePermitAssignmentFormData,
} from "./assignment.types"

// Keep the assignment rules in one file for now so this feature stays easier
// to read and change while the flow is still being defined.

// ==========================================
// PAGE DATA
// ==========================================

export async function getAssignmentsInitialPageState(): Promise<AssignmentPageState> {
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
		...buildPermitSummary(permits),
		communities,
		users,
		assignments,
		assignmentCards: buildAssignmentCards(assignments),
	}
}

export async function getAssignmentsPageStateForSeason(
	selectedSeasonId: string,
): Promise<AssignmentPageState> {
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
		...buildPermitSummary(permits),
		communities,
		users,
		assignments,
		assignmentCards: buildAssignmentCards(assignments),
	}
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

export async function savePermitAssignment(data: SavePermitAssignmentFormData) {
	const formData = normalizeSavePermitAssignmentForm(data)

	if (!formData.seasonId || !formData.permitId) {
		throw new AssignmentManagementError(
			"Temporada y permiso son obligatorios",
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

	try {
		const result = await saveAssignmentForPermitRecord(
			formData.permitId,
			formData.userId || null,
		)

		if (result === "permit_missing") {
			throw new AssignmentManagementError("Ese permiso ya no existe")
		}
		if (result === "permit_locked") {
			throw new AssignmentManagementError(
				"El encargado no puede cambiarse después de descargar el permiso",
			)
		}
		if (result === "user_unavailable") {
			throw new AssignmentManagementError(
				"El encargado ya no está disponible",
			)
		}
	} catch (error) {
		if (error instanceof AssignmentManagementError) throw error
		throwAssignmentCreationError(error)
	}
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

function normalizeSavePermitAssignmentForm(data: SavePermitAssignmentFormData) {
	return {
		seasonId: data.seasonId.trim(),
		communityId: data.communityId.trim(),
		permitId: data.permitId.trim(),
		userId: data.userId.trim(),
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

function buildPermitSummary(permits: AssignmentPageState["permits"]) {
	return {
		communitiesWithPermitsCount: new Set(
			permits.map((permit) => permit.communityId),
		).size,
		permitsCount: permits.length,
	}
}

function throwAssignmentCreationError(error: unknown): never {
	const uniqueConstraint = getPostgresConstraintName(
		error,
		POSTGRES_ERROR_CODES.uniqueViolation,
	)

	if (uniqueConstraint === "assignments_permit_unique") {
		throw new AssignmentManagementError("Ese permiso ya tiene un encargado")
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
	assignments: AssignmentPageState["assignments"],
): AssignmentPermitCard[] {
	return assignments.map((assignment) => ({
		permitId: assignment.permitId,
		permitNumber: assignment.permitNumber,
		seasonName: assignment.seasonName,
		communityId: assignment.communityId,
		communityName: assignment.communityName,
		user: {
			assignmentId: assignment.id,
			userId: assignment.userId,
			userFullName: assignment.userFullName,
		},
	}))
}
