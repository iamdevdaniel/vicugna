import { SYNCED_PERMIT_STATUSES } from "../common/common.constants"
import { listSeasons } from "../common/common.repository"
import { compareUserNames, getUserFullName } from "../users/user-name"
import { MonitoringError } from "./monitoring.errors"
import {
	listMonitoringAssignments,
	reopenSyncedPermit,
} from "./monitoring.repository"
import type {
	MonitoringCommunityGroup,
	MonitoringPageData,
	MonitoringPermitGroup,
	SelectedMonitoringPermit,
} from "./monitoring.types"

export async function reopenPermit(permitId: string): Promise<void> {
	if (!permitId) {
		throw new MonitoringError("El permiso es obligatorio")
	}

	const ok = await reopenSyncedPermit(permitId)

	if (!ok) {
		throw new MonitoringError(
			"Solo se puede reabrir un permiso sincronizado",
		)
	}
}

export async function getMonitoringPageState(
	selectedSeasonId?: string,
	selectedPermitId?: string,
): Promise<
	Omit<
		MonitoringPageData,
		| "pageTitle"
		| "adminUser"
		| "syncedStatuses"
		| "formMessage"
		| "formMessageType"
	>
> {
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

	const sortedAssignments = [...assignments].sort((left, right) => {
		if (left.active !== right.active) {
			return left.active ? -1 : 1
		}

		return compareUserNames(left.user, right.user)
	})

	for (const assignment of sortedAssignments) {
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
			fullName: getUserFullName(assignment.user),
			active: assignment.active,
		})
	}

	return Array.from(communitiesById.values())
		.map((communityGroup) => ({
			...communityGroup,
			permits: communityGroup.permits.sort((left, right) =>
				left.permitNumber.localeCompare(right.permitNumber, undefined, {
					numeric: true,
				}),
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
		syncStatus: assignment.permit.syncStatus,
		syncedAt: assignment.permit.syncedAt?.toISOString() ?? null,
		participantsCount: SYNCED_PERMIT_STATUSES.includes(
			assignment.permit.syncStatus,
		)
			? assignment.permit.participants.length
			: null,
		cleaningRecordsCount: SYNCED_PERMIT_STATUSES.includes(
			assignment.permit.syncStatus,
		)
			? assignment.permit.cleaningCommonRecords.length
			: null,
		shearingRecordsCount: SYNCED_PERMIT_STATUSES.includes(
			assignment.permit.syncStatus,
		)
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
			syncStatus: permit.syncStatus,
			syncedAt: permit.syncedAt,
			syncedAtLabel: formatSyncedAtLabel(permit.syncedAt),
			assignedUsersCount: permit.users.length,
			participantsCount: permit.participantsCount,
			cleaningRecordsCount: permit.cleaningRecordsCount,
			shearingRecordsCount: permit.shearingRecordsCount,
			users: permit.users,
		}
	}

	return null
}

function formatSyncedAtLabel(syncedAt: string | null) {
	if (!syncedAt) {
		return null
	}

	return new Intl.DateTimeFormat("es-BO", {
		weekday: "long",
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(syncedAt))
}
