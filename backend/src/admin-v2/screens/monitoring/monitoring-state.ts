import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { SYNCED_PERMIT_STATUSES } from "../../../modules/common/common.constants"
import type { MonitoringCommunityGroup } from "../../../modules/monitoring/monitoring.types"

type StoredMonitoringState = {
	search: string
	showSyncedOnly: boolean
	expandedCommunityIds: string[]
	scrollTop: number
}

export function useMonitoringState(
	seasonId: string,
	communityGroups: MonitoringCommunityGroup[],
) {
	const storageKey = `monitoring-overview:${seasonId}`
	const allCommunityIds = useMemo(
		() => communityGroups.map((group) => group.communityId),
		[communityGroups],
	)
	const [search, setSearch] = useState("")
	const [showSyncedOnly, setShowSyncedOnly] = useState(false)
	const [expandedCommunityIds, setExpandedCommunityIds] =
		useState(allCommunityIds)
	const [hydrated, setHydrated] = useState(false)
	const scrollContainerRef = useRef<HTMLDivElement>(null)
	const savedScrollTop = useRef(0)
	const scrollSaveTimeout = useRef<number>(undefined)

	useEffect(() => {
		const stored = readStoredState(storageKey)
		if (stored) {
			setSearch(stored.search)
			setShowSyncedOnly(stored.showSyncedOnly)
			setExpandedCommunityIds(
				stored.expandedCommunityIds.filter((id) =>
					allCommunityIds.includes(id),
				),
			)
			savedScrollTop.current = stored.scrollTop
		}
		setHydrated(true)
	}, [allCommunityIds, storageKey])

	useEffect(() => {
		if (!hydrated) return
		const frame = window.requestAnimationFrame(() => {
			if (scrollContainerRef.current) {
				scrollContainerRef.current.scrollTop = savedScrollTop.current
			}
		})
		return () => window.cancelAnimationFrame(frame)
	}, [hydrated])

	const saveState = useCallback(() => {
		try {
			window.sessionStorage.setItem(
				storageKey,
				JSON.stringify({
					search,
					showSyncedOnly,
					expandedCommunityIds,
					scrollTop: scrollContainerRef.current?.scrollTop ?? 0,
				}),
			)
		} catch {
			// Filtering still works when browser storage is unavailable.
		}
	}, [expandedCommunityIds, search, showSyncedOnly, storageKey])

	useEffect(() => {
		if (!hydrated) return
		saveState()
	}, [hydrated, saveState])

	useEffect(
		() => () => {
			if (scrollSaveTimeout.current) {
				window.clearTimeout(scrollSaveTimeout.current)
			}
		},
		[],
	)

	const filteredCommunityGroups = useMemo(() => {
		const normalizedSearch = search.trim().toLocaleLowerCase("es")
		return communityGroups
			.map((community) => ({
				...community,
				permits: community.permits.filter((permit) => {
					if (
						showSyncedOnly &&
						!SYNCED_PERMIT_STATUSES.includes(permit.syncStatus)
					)
						return false
					if (!normalizedSearch) return true
					return [
						community.communityName,
						permit.permitNumber,
						...permit.users.map((user) => user.fullName),
					]
						.join(" ")
						.toLocaleLowerCase("es")
						.includes(normalizedSearch)
				}),
			}))
			.filter((community) => community.permits.length > 0)
	}, [communityGroups, search, showSyncedOnly])

	const areAllCommunitiesExpanded =
		allCommunityIds.length > 0 &&
		allCommunityIds.every((id) => expandedCommunityIds.includes(id))

	return {
		search,
		showSyncedOnly,
		filteredCommunityGroups,
		areAllCommunitiesExpanded,
		scrollContainerRef,
		setSearch,
		toggleSyncedOnly: () => setShowSyncedOnly((current) => !current),
		isExpanded: (communityId: string) =>
			Boolean(search.trim() || showSyncedOnly) ||
			expandedCommunityIds.includes(communityId),
		toggleCommunity: (communityId: string) =>
			setExpandedCommunityIds((current) =>
				current.includes(communityId)
					? current.filter((id) => id !== communityId)
					: [...current, communityId],
			),
		toggleAllCommunities: () =>
			setExpandedCommunityIds(
				areAllCommunitiesExpanded ? [] : allCommunityIds,
			),
		handleScroll: () => {
			if (scrollSaveTimeout.current) {
				window.clearTimeout(scrollSaveTimeout.current)
			}
			scrollSaveTimeout.current = window.setTimeout(saveState, 150)
		},
		saveState,
	}
}

function readStoredState(storageKey: string): StoredMonitoringState | null {
	try {
		const rawState = window.sessionStorage.getItem(storageKey)
		if (!rawState) return null
		const state = JSON.parse(rawState) as Partial<StoredMonitoringState>
		if (
			typeof state.search !== "string" ||
			typeof state.showSyncedOnly !== "boolean" ||
			!Array.isArray(state.expandedCommunityIds) ||
			typeof state.scrollTop !== "number"
		) {
			return null
		}
		return state as StoredMonitoringState
	} catch {
		return null
	}
}
