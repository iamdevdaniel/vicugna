import { listSeasons } from "@common"
import { listMonitoringAssignments } from "./monitoring.repository"
import type {
	MonitoringCommunityGroup,
	MonitoringPageData,
	MonitoringPermitGroup,
	SelectedMonitoringPermit,
} from "./monitoring.types"

export async function getMonitoringPageState(
	selectedSeasonId?: string,
	selectedPermitId?: string,
): Promise<Omit<MonitoringPageData, "pageTitle" | "adminUser">> {
	const seasons = await listSeasons()
	const resolvedSeasonId = selectedSeasonId || seasons[0]?.id || ""
	const assignments = resolvedSeasonId
		? await listMonitoringAssignments(resolvedSeasonId)
		: []
	const communityGroups = buildCommunityGroups(assignments)

	return {
		selectedSeasonId: resolvedSeasonId,
		seasons: seasons.map((season) => ({
			id: season.id,
			name: season.name,
		})),
		communitiesCount: communityGroups.length,
		permitsCount: communityGroups.reduce(
			(total, community) => total + community.permits.length,
			0,
		),
		assignedUsersCount: assignments.length,
		communityGroups,
		selectedPermit: getSelectedPermit(communityGroups, selectedPermitId),
	}
}

function buildCommunityGroups(
	assignments: Awaited<ReturnType<typeof listMonitoringAssignments>>,
): MonitoringCommunityGroup[] {
	const communitiesById = new Map<string, MonitoringCommunityGroup>()

	for (const assignment of assignments) {
		let communityGroup = communitiesById.get(assignment.communityId)

		if (!communityGroup) {
			communityGroup = {
				communityId: assignment.communityId,
				communityName: assignment.community.name,
				permits: [],
			}
			communitiesById.set(assignment.communityId, communityGroup)
		}

		let permitGroup = communityGroup.permits.find(
			(currentPermit) => currentPermit.permitId === assignment.permitId,
		)

		if (!permitGroup) {
			permitGroup = createPermitGroup(assignment)
			communityGroup.permits.push(permitGroup)
		}

		permitGroup.users.push({
			userId: assignment.userId,
			fullName: assignment.user.fullName,
			active: assignment.active,
		})
	}

	return Array.from(communitiesById.values())
		.map((communityGroup) => ({
			...communityGroup,
			permits: communityGroup.permits
				.map((permitGroup) => ({
					...permitGroup,
					users: permitGroup.users.sort((left, right) => {
						if (left.active !== right.active) {
							return left.active ? -1 : 1
						}

						return left.fullName.localeCompare(right.fullName)
					}),
				}))
				.sort((left, right) =>
					left.permitNumber.localeCompare(
						right.permitNumber,
						undefined,
						{ numeric: true },
					),
				),
		}))
		.sort((left, right) =>
			left.communityName.localeCompare(right.communityName),
		)
}

function createPermitGroup(
	assignment: Awaited<ReturnType<typeof listMonitoringAssignments>>[number],
): MonitoringPermitGroup {
	return {
		permitId: assignment.permitId,
		communityId: assignment.communityId,
		communityName: assignment.community.name,
		permitNumber: assignment.permit.permitNumber,
		isSynced: assignment.permit.isSynced,
		syncedAt: assignment.permit.syncedAt?.toISOString() ?? null,
		participantsCount: assignment.permit.isSynced
			? assignment.permit.participants.length
			: null,
		cleaningRecordsCount: assignment.permit.isSynced
			? assignment.permit.cleaningCommonRecords.length
			: null,
		shearingRecordsCount: assignment.permit.isSynced
			? assignment.permit.shearingRecords.length
			: null,
		users: [],
	}
}

function getSelectedPermit(
	communityGroups: MonitoringCommunityGroup[],
	selectedPermitId?: string,
): SelectedMonitoringPermit | null {
	if (!selectedPermitId) {
		return null
	}

	for (const communityGroup of communityGroups) {
		const permit = communityGroup.permits.find(
			(currentPermit) => currentPermit.permitId === selectedPermitId,
		)

		if (!permit) {
			continue
		}

		return {
			permitId: permit.permitId,
			communityId: permit.communityId,
			communityName: permit.communityName,
			permitNumber: permit.permitNumber,
			isSynced: permit.isSynced,
			syncedAt: permit.syncedAt,
			assignedUsersCount: permit.users.length,
		}
	}

	return null
}
