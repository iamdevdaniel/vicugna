import {
	listAssignmentCommunities,
	listAssignmentSeasons,
	listAssignments,
	listAssignmentUsers,
} from "./assignment.repository"
import type { AssignmentPageData } from "./assignment.types"

export async function getAssignmentsPageState(): Promise<
	Omit<AssignmentPageData, "pageTitle" | "adminUser">
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
