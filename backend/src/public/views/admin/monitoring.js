function monitoringPageState(initialData) {
	const storageKey = `monitoring-overview:${initialData.seasonId}`
	const savedState = readMonitoringState(storageKey)
	const initialExpandedIds =
		savedState?.expandedCommunityIds ??
		initialData.communityGroups.map((group) => group.communityId)

	return {
		seasonId: initialData.seasonId,
		communityGroups: initialData.communityGroups,
		search: savedState?.search ?? "",
		expandedCommunityIds: initialExpandedIds,
		init() {
			this.$nextTick(() => {
				if (
					!this.$refs.scrollContainer ||
					typeof savedState?.scrollTop !== "number"
				) {
					return
				}

				this.$refs.scrollContainer.scrollTop = savedState.scrollTop
			})
		},
		get filteredCommunityGroups() {
			const search = this.search.trim().toLowerCase()

			if (!search) {
				return this.communityGroups
			}

			return this.communityGroups
				.map((community) => ({
					...community,
					permits: community.permits.filter((permit) => {
						const haystack = [
							community.communityName,
							permit.permitNumber,
							...permit.users.map((user) => user.fullName),
						]
							.join(" ")
							.toLowerCase()

						return haystack.includes(search)
					}),
				}))
				.filter((community) => community.permits.length > 0)
		},
		isExpanded(communityId) {
			if (this.search.trim()) {
				return true
			}

			return this.expandedCommunityIds.includes(communityId)
		},
		toggleCommunity(communityId) {
			if (this.expandedCommunityIds.includes(communityId)) {
				this.expandedCommunityIds = this.expandedCommunityIds.filter(
					(currentId) => currentId !== communityId,
				)
			} else {
				this.expandedCommunityIds = [
					...this.expandedCommunityIds,
					communityId,
				]
			}

			this.saveState()
		},
		expandAll() {
			this.expandedCommunityIds = this.communityGroups.map(
				(community) => community.communityId,
			)
			this.saveState()
		},
		collapseAll() {
			this.expandedCommunityIds = []
			this.saveState()
		},
		handleScroll() {
			this.saveState()
		},
		principalUserName(permit) {
			const principalUser = permit.users.find((user) => user.active)

			return principalUser?.fullName ?? "Sin principal"
		},
		permitHref(permitId) {
			const searchParams = new URLSearchParams({
				seasonId: this.seasonId,
				permitId,
			})

			return `/admin/monitoring?${searchParams.toString()}`
		},
		saveState() {
			const stateToSave = {
				search: this.search,
				expandedCommunityIds: this.expandedCommunityIds,
				scrollTop: this.$refs.scrollContainer?.scrollTop ?? 0,
			}

			window.sessionStorage.setItem(
				storageKey,
				JSON.stringify(stateToSave),
			)
		},
	}
}

function readMonitoringState(storageKey) {
	const rawState = window.sessionStorage.getItem(storageKey)

	if (!rawState) {
		return null
	}

	try {
		return JSON.parse(rawState)
	} catch {
		return null
	}
}

window.monitoringPageState = monitoringPageState
