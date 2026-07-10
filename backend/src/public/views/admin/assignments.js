function assignmentPageState(initialData) {
	const selectedPermitId = initialData.selectedPermit?.id ?? ""

	return {
		permits: initialData.permits,
		communities: initialData.communities,
		users: initialData.users,
		assignmentCards: initialData.assignmentCards,
		stagedAssignmentsByPermit: {},
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
			if (!this.hasSelectedCommunity) {
				return []
			}

			return this.permits.filter(
				(permit) => permit.communityId === this.selectedCommunityId,
			)
		},
		get hasSelectedCommunity() {
			return this.communities.some(
				(community) => community.id === this.selectedCommunityId,
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
			for (const user of this.stagedUsersForSelectedPermit) {
				assignedUserIds.add(user.userId)
			}
			const search = this.userSearch.trim().toLowerCase()

			return this.users
				.filter((user) => !assignedUserIds.has(user.id))
				.filter((user) =>
					search ? user.name.toLowerCase().includes(search) : true,
				)
				.slice(0, 8)
		},
		get stagedUsersForSelectedPermit() {
			if (!this.selectedPermitId) {
				return []
			}

			return this.stagedAssignmentsByPermit[this.selectedPermitId] ?? []
		},
		get stagedActiveUserId() {
			const activeUser = this.stagedUsersForSelectedPermit.find(
				(user) => user.active,
			)

			return activeUser?.userId ?? ""
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
		handleCommunitySearchInput() {
			this.isCommunityDropdownOpen = true

			if (this.communitySearch.trim()) {
				return
			}

			this.selectedCommunityId = ""
			this.selectedPermitId = ""
			this.selectedUserId = ""
			this.userSearch = ""
			this.isUserDropdownOpen = false
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
		addUserToStage(user) {
			if (!this.selectedPermitId) {
				return
			}

			const currentUsers =
				this.stagedAssignmentsByPermit[this.selectedPermitId] ?? []
			const hasPersistedActiveUser = this.selectedPermitAssignments.some(
				(currentUser) => currentUser.active,
			)
			const hasStagedActiveUser = currentUsers.some(
				(currentUser) => currentUser.active,
			)

			this.stagedAssignmentsByPermit[this.selectedPermitId] = [
				...currentUsers,
				{
					userId: user.id,
					userFullName: user.name,
					active: !hasPersistedActiveUser && !hasStagedActiveUser,
				},
			]

			this.selectedUserId = ""
			this.userSearch = ""
			this.isUserDropdownOpen = false
		},
		removeStagedUser(userId) {
			if (!this.selectedPermitId) {
				return
			}

			const currentUsers =
				this.stagedAssignmentsByPermit[this.selectedPermitId] ?? []
			const userToRemove = currentUsers.find(
				(currentUser) => currentUser.userId === userId,
			)
			const remainingUsers = currentUsers.filter(
				(currentUser) => currentUser.userId !== userId,
			)

			if (!userToRemove) {
				return
			}

			const hasPersistedActiveUser = this.selectedPermitAssignments.some(
				(currentUser) => currentUser.active,
			)

			if (
				userToRemove.active &&
				!hasPersistedActiveUser &&
				remainingUsers.length > 0
			) {
				remainingUsers[0] = {
					...remainingUsers[0],
					active: true,
				}
			}

			this.stagedAssignmentsByPermit[this.selectedPermitId] =
				remainingUsers
		},
		setStagedUserActive(userId) {
			if (!this.selectedPermitId) {
				return
			}

			const currentUsers =
				this.stagedAssignmentsByPermit[this.selectedPermitId] ?? []

			this.stagedAssignmentsByPermit[this.selectedPermitId] =
				currentUsers.map((currentUser) => ({
					...currentUser,
					active: currentUser.userId === userId,
				}))
		},
		permitAssignedUsersCount(permit) {
			const card = this.assignmentCards.find(
				(currentCard) => currentCard.permitId === permit.id,
			)
			const stagedUsers = this.stagedAssignmentsByPermit[permit.id] ?? []

			if (!card) {
				return stagedUsers.length
			}

			return card.users.length + stagedUsers.length
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
