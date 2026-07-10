function assignmentSeasonState(initialData) {
	return {
		permits: initialData.permits,
		communities: initialData.communities,
		users: initialData.users,
		assignments: initialData.assignments,
		assignmentCards: initialData.assignmentCards,
		permitSearch: "",
		selectedPermitId: initialData.selectedPermit?.id ?? "",
		selectedSeasonId: initialData.selectedSeasonId,
		isCommunityPickerOpen: false,
		communitySearch: "",
		selectedCommunityId: "",
		isUserPickerOpen: false,
		userSearch: "",
		selectedUserId: "",
		get selectedPermit() {
			const permit = this.permits.find(
				(currentPermit) => currentPermit.id === this.selectedPermitId,
			)

			if (!permit) {
				return null
			}

			return {
				id: permit.id,
				permitNumber: permit.permitNumber,
			}
		},
		get selectedPermitAssignments() {
			if (!this.selectedPermitId) {
				return []
			}

			return this.assignments.filter(
				(assignment) => assignment.permitId === this.selectedPermitId,
			)
		},
		get selectedPermitCommunityId() {
			return this.selectedPermitAssignments[0]?.communityId ?? ""
		},
		get selectedPermitCommunityName() {
			const community = this.communities.find(
				(currentCommunity) =>
					currentCommunity.id === this.selectedPermitCommunityId,
			)

			return community?.name ?? ""
		},
		get filteredCommunities() {
			const search = this.communitySearch.trim().toLowerCase()

			if (!search) return this.communities.slice(0, 8)

			return this.communities
				.filter((community) => community.name.toLowerCase().includes(search))
				.slice(0, 8)
		},
		get eligibleUsers() {
			const assignedUserIds = new Set(
				this.selectedPermitAssignments.map((assignment) => assignment.userId),
			)
			const search = this.userSearch.trim().toLowerCase()

			return this.users
				.filter((user) => !assignedUserIds.has(user.id))
				.filter((user) =>
					search ? user.name.toLowerCase().includes(search) : true,
				)
				.slice(0, 8)
		},
		get filteredPermits() {
			const search = this.permitSearch.trim().toLowerCase()

			if (!search) return this.permits

			return this.permits.filter((permit) =>
				permit.permitNumber.toLowerCase().includes(search),
			)
		},
		selectPermit(permit) {
			this.selectedPermitId =
				this.selectedPermitId === permit.id ? "" : permit.id
			this.clearCommunity()
			this.clearUser()
			this.isCommunityPickerOpen = false
			this.isUserPickerOpen = false

			queueMicrotask(() => {
				if (!this.selectedPermitId) {
					return
				}

				const selectedCard = document.querySelector(
					`[data-assignment-card-id="${this.selectedPermitId}"]`,
				)

				if (!(selectedCard instanceof HTMLElement)) {
					return
				}

				selectedCard.scrollIntoView({
					behavior: "smooth",
					block: "nearest",
				})
			})
		},
		selectCommunity(community) {
			this.selectedCommunityId = community.id
			this.communitySearch = community.name
			this.isCommunityPickerOpen = false
		},
		clearCommunity() {
			this.selectedCommunityId = ""
			this.communitySearch = ""
			this.isCommunityPickerOpen = false
		},
		selectUser(user) {
			this.selectedUserId = user.id
			this.userSearch = user.name
			this.isUserPickerOpen = false
		},
		clearUser() {
			this.selectedUserId = ""
			this.userSearch = ""
			this.isUserPickerOpen = false
		},
	}
}
