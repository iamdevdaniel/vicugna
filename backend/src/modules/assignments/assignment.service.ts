import {
	getPostgresConstraintName,
	POSTGRES_ERROR_CODES,
} from "../../db/errors"
import { AssignmentManagementError } from "./assignment.errors"
import {
	createAssignment as createAssignmentRecord,
	createPermit as createPermitRecord,
	findPermitByNumber,
	listAssignments,
	listAssignmentUsers,
	listCommunities,
	listEligibleAssignmentUsersByPermit,
	listSeasons,
} from "./assignment.repository"
import type {
	AssignmentPageData,
	CreateAssignmentFormData,
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
	const [users, assignments] = await Promise.all([
		selectedSeasonId ? listAssignmentUsers() : [],
		selectedSeasonId ? listAssignments(selectedSeasonId) : [],
	])

	return {
		selectedSeasonId,
		seasons,
		communities,
		users,
		assignments,
	}
}

export async function getAssignmentsPageStateForSeason(
	selectedSeasonId: string,
): Promise<
	Omit<AssignmentPageData, "pageTitle" | "adminUser" | "formMessage">
> {
	const [seasons, communities, users, assignments] = await Promise.all([
		listSeasons(),
		listCommunities(),
		selectedSeasonId ? listAssignmentUsers() : [],
		selectedSeasonId ? listAssignments(selectedSeasonId) : [],
	])

	return {
		selectedSeasonId,
		seasons,
		communities,
		users,
		assignments,
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

	const existingPermit = await findPermitByNumber(formData.permitNumber)

	if (existingPermit) {
		throw new AssignmentManagementError("Ese permiso ya existe")
	}

	return {
		permitId: await createPermitRecord(formData.permitNumber),
	}
}

export async function createAssignment(data: CreateAssignmentFormData) {
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

	try {
		await createAssignmentRecord(formData)
	} catch (error) {
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

function normalizeCreateAssignmentForm(
	data: CreateAssignmentFormData,
): CreateAssignmentFormData {
	return {
		seasonId: data.seasonId.trim(),
		communityId: data.communityId.trim(),
		userId: data.userId.trim(),
		permitId: data.permitId.trim(),
	}
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
