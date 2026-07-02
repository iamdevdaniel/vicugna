import {
	getPostgresConstraintName,
	POSTGRES_ERROR_CODES,
} from "../../db/errors"
import { AssignmentManagementError } from "./assignment.errors"
import {
	findAssignmentBySeasonAndCommunity,
	listAssignmentCommunities,
	listAssignmentSeasons,
	listAssignments,
	listAssignmentUsers,
	saveAssignmentPermit,
} from "./assignment.repository"
import type {
	AssignmentPageData,
	CreateAssignmentFormData,
} from "./assignment.types"

export async function getAssignmentsPageState(): Promise<
	Omit<AssignmentPageData, "pageTitle" | "adminUser" | "formMessage">
> {
	const [seasons, communities, users, assignments] = await Promise.all([
		listAssignmentSeasons(),
		listAssignmentCommunities(),
		listAssignmentUsers(),
		listAssignments(),
	])

	return {
		seasons,
		communities,
		users,
		assignments,
	}
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

	const existingAssignment = await findAssignmentBySeasonAndCommunity(
		formData.seasonId,
		formData.communityId,
	)

	if (existingAssignment && existingAssignment.userId !== formData.userId) {
		throw new AssignmentManagementError(
			"Esa comunidad ya tiene otro encargado en esa temporada",
		)
	}

	try {
		await saveAssignmentPermit(formData, {
			shouldCreateAssignment: !existingAssignment,
		})
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

	if (uniqueConstraint === "community_assignments_season_community_unique") {
		throw new AssignmentManagementError(
			"Esa comunidad ya tiene un encargado en esa temporada",
		)
	}

	if (uniqueConstraint === "permits_season_community_number_unique") {
		throw new AssignmentManagementError(
			"Ese permiso ya existe para esa comunidad en esa temporada",
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
