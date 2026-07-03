import {
	getPostgresConstraintName,
	POSTGRES_ERROR_CODES,
} from "../../db/errors"
import { AssignmentManagementError } from "./assignment.errors"
import {
	findAssignmentBySeasonAndUser,
	listAssignmentCommunities,
	listAssignmentSeasons,
	listAssignments,
	listAvailableAssignmentUsers,
	saveAssignment,
} from "./assignment.repository"
import type {
	AssignmentPageData,
	CreateAssignmentFormData,
} from "./assignment.types"

export async function getAssignmentsInitialPageState(): Promise<
	Omit<AssignmentPageData, "pageTitle" | "adminUser" | "formMessage">
> {
	const [seasons, communities, assignments] = await Promise.all([
		listAssignmentSeasons(),
		listAssignmentCommunities(),
		listAssignments(),
	])

	const selectedSeasonId = seasons[0]?.id ?? ""
	const users = selectedSeasonId
		? await listAvailableAssignmentUsers(selectedSeasonId)
		: []

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
	const [seasons, communities, assignments] = await Promise.all([
		listAssignmentSeasons(),
		listAssignmentCommunities(),
		listAssignments(),
	])

	const users = selectedSeasonId
		? await listAvailableAssignmentUsers(selectedSeasonId)
		: []

	return {
		selectedSeasonId,
		seasons,
		communities,
		users,
		assignments,
	}
}

export async function getAvailableAssignmentUsers(selectedSeasonId: string) {
	if (!selectedSeasonId) {
		return []
	}

	return listAvailableAssignmentUsers(selectedSeasonId)
}

export async function createAssignment(data: CreateAssignmentFormData) {
	const formData = normalizeCreateAssignmentForm(data)

	if (
		!formData.seasonId ||
		!formData.communityId ||
		!formData.userId ||
		!formData.permitNumber
	) {
		throw new AssignmentManagementError(
			"Temporada, comunidad, encargado y permiso son obligatorios",
		)
	}

	const existingAssignment = await findAssignmentBySeasonAndUser(
		formData.seasonId,
		formData.userId,
	)

	if (existingAssignment) {
		throw new AssignmentManagementError(
			"Ese encargado ya tiene un permiso en esa temporada",
		)
	}

	try {
		await saveAssignment(formData)
	} catch (error) {
		throwAssignmentCreationError(error)
	}
}

function normalizeCreateAssignmentForm(
	data: CreateAssignmentFormData,
): CreateAssignmentFormData {
	return {
		seasonId: data.seasonId.trim(),
		communityId: data.communityId.trim(),
		userId: data.userId.trim(),
		permitNumber: data.permitNumber.trim(),
	}
}

function throwAssignmentCreationError(error: unknown): never {
	const uniqueConstraint = getPostgresConstraintName(
		error,
		POSTGRES_ERROR_CODES.uniqueViolation,
	)

	if (uniqueConstraint === "assignments_season_user_unique") {
		throw new AssignmentManagementError(
			"Ese encargado ya tiene un permiso en esa temporada",
		)
	}

	if (uniqueConstraint === "permits_permit_number_unique") {
		throw new AssignmentManagementError("Ese permiso ya existe")
	}

	if (uniqueConstraint === "assignments_permit_id_unique") {
		throw new AssignmentManagementError("Ese permiso ya esta asignado")
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
