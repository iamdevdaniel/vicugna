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
		showSyncedOnly: savedState?.showSyncedOnly ?? false,
		expandedCommunityIds: initialExpandedIds,
		scrollSaveTimeout: null,
		init() {
			this.$nextTick(() => {
				if (
					!this.$refs.scrollContainer ||
					typeof savedState?.scrollTop !== "number"
				)
					return

				this.$refs.scrollContainer.scrollTop = savedState.scrollTop
			})
		},
		get filteredCommunityGroups() {
			const search = this.search.trim().toLowerCase()
			const showSyncedOnly = this.showSyncedOnly

			if (!search && !showSyncedOnly) {
				return this.communityGroups
			}

			return this.communityGroups
				.map((community) => ({
					...community,
					permits: community.permits.filter((permit) => {
						if (showSyncedOnly && !permit.isSynced) {
							return false
						}

						const haystack = [
							community.communityName,
							permit.permitNumber,
							...permit.users.map((user) => user.fullName),
						]
							.join(" ")
							.toLowerCase()

						if (!search) {
							return true
						}

						return haystack.includes(search)
					}),
				}))
				.filter((community) => community.permits.length > 0)
		},
		isExpanded(communityId) {
			if (this.search.trim() || this.showSyncedOnly) {
				return true
			}

			return this.expandedCommunityIds.includes(communityId)
		},
		get areAllCommunitiesExpanded() {
			return (
				this.communityGroups.length > 0 &&
				this.expandedCommunityIds.length === this.communityGroups.length
			)
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
		toggleAllCommunities() {
			if (this.areAllCommunitiesExpanded) {
				this.expandedCommunityIds = []
			} else {
				this.expandedCommunityIds = this.communityGroups.map(
					(community) => community.communityId,
				)
			}

			this.saveState()
		},
		toggleShowSyncedOnly() {
			this.showSyncedOnly = !this.showSyncedOnly
			this.saveState()
		},
		handleScroll() {
			clearTimeout(this.scrollSaveTimeout)

			this.scrollSaveTimeout = setTimeout(() => {
				this.saveState()
			}, 150)
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
				showSyncedOnly: this.showSyncedOnly,
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
