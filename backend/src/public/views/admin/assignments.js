function assignmentPageState(initialData) {
	const selectedPermitId = initialData.selectedPermit?.id ?? ""

	return {
		permits: initialData.permits,
		communities: initialData.communities,
		users: initialData.users,
		assignmentCards: initialData.assignmentCards,
		newPermitNumber: "",
		communitySearch: "",
		userSearch: "",
		assignmentSearch: "",
		selectedCommunityId:
			initialData.selectedCommunityId ||
			initialData.selectedPermit?.communityId ||
			"",
		selectedPermitId,
		selectedUserId: "",
		isCommunityDropdownOpen: false,
		isUserDropdownOpen: false,
		init() {
			const selectedCommunity = this.communities.find(
				(community) => community.id === this.selectedCommunityId,
			)

			if (selectedCommunity) {
				this.communitySearch = selectedCommunity.name
			}
		},
		get filteredCommunities() {
			const search = this.communitySearch.trim().toLowerCase()

			if (!search) {
				return this.communities.slice(0, 8)
			}

			return this.communities
				.filter((community) =>
					community.name.toLowerCase().includes(search),
				)
				.slice(0, 8)
		},
		get filteredPermits() {
			if (!this.selectedCommunityId) {
				return []
			}

			return this.permits.filter(
				(permit) => permit.communityId === this.selectedCommunityId,
			)
		},
		get selectedPermit() {
			const permit = this.permits.find(
				(currentPermit) => currentPermit.id === this.selectedPermitId,
			)

			if (!permit) {
				return null
			}

			return permit
		},
		get selectedPermitAssignments() {
			const card = this.assignmentCards.find(
				(currentCard) => currentCard.permitId === this.selectedPermitId,
			)

			return card?.users ?? []
		},
		get eligibleUsers() {
			if (!this.selectedPermit) {
				return []
			}

			const assignedUserIds = new Set(
				this.selectedPermitAssignments.map((user) => user.userId),
			)
			const search = this.userSearch.trim().toLowerCase()

			return this.users
				.filter((user) => !assignedUserIds.has(user.id))
				.filter((user) =>
					search ? user.name.toLowerCase().includes(search) : true,
				)
				.slice(0, 8)
		},
		get filteredAssignmentCards() {
			const search = this.assignmentSearch.trim().toLowerCase()

			const filteredCards = this.assignmentCards.filter((card) => {
				if (
					this.selectedCommunityId &&
					card.communityId !== this.selectedCommunityId
				) {
					return false
				}

				if (!search) {
					return true
				}

				const haystack = [
					card.communityName,
					card.permitNumber,
					...card.users.map((user) => user.userFullName),
				]
					.join(" ")
					.toLowerCase()

				return haystack.includes(search)
			})

			return filteredCards.sort((left, right) => {
				if (left.permitId === this.selectedPermitId) return -1
				if (right.permitId === this.selectedPermitId) return 1
				return 0
			})
		},
		selectCommunity(community) {
			this.selectedCommunityId = community.id
			this.communitySearch = community.name
			this.selectedPermitId = ""
			this.selectedUserId = ""
			this.userSearch = ""
			this.isCommunityDropdownOpen = false
		},
		selectPermit(permit) {
			if (this.selectedPermitId === permit.id) {
				this.selectedPermitId = ""
				this.selectedUserId = ""
				this.userSearch = ""
				this.isUserDropdownOpen = false
				return
			}

			this.selectedPermitId = permit.id
			this.selectedCommunityId = permit.communityId
			this.communitySearch = permit.communityName
			this.selectedUserId = ""
			this.userSearch = ""
			this.isUserDropdownOpen = false
		},
		selectPermitById(permitId) {
			const permit = this.permits.find(
				(currentPermit) => currentPermit.id === permitId,
			)

			if (!permit) {
				return
			}

			this.selectPermit(permit)
		},
		selectUser(user) {
			this.selectedUserId = user.id
			this.userSearch = user.name
			this.isUserDropdownOpen = false
		},
		permitAssignedUsersCount(permit) {
			const card = this.assignmentCards.find(
				(currentCard) => currentCard.permitId === permit.id,
			)

			if (!card) {
				return 0
			}

			return card.users.length
		},
		assignmentCardBadge(card) {
			const activeUser = card.users.find((user) => user.active)

			if (!activeUser) {
				return "Sin activo"
			}

			return card.users.length === 1
				? "1 usuario"
				: `${card.users.length} usuarios`
		},
	}
}

window.assignmentPageState = assignmentPageState
