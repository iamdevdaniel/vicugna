function assignmentPageState(initialData) {
	const selectedPermitId = initialData.selectedPermit?.id ?? ""

	return {
		permits: initialData.permits,
		communities: initialData.communities,
		users: initialData.users,
		assignmentCards: initialData.assignmentCards,
		draftAssignmentsByPermit: {},
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
		skipUnloadWarning: false,
		init() {
			const selectedCommunity = this.communities.find(
				(community) => community.id === this.selectedCommunityId,
			)

			if (selectedCommunity) {
				this.communitySearch = selectedCommunity.name
			}

			window.addEventListener("beforeunload", (event) => {
				if (!this.hasDirtyDrafts || this.skipUnloadWarning) {
					return
				}

				event.preventDefault()
				event.returnValue = ""
			})
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

			return permit ?? null
		},
		get savedUsersForSelectedPermit() {
			return this.getSavedUsersForPermit(this.selectedPermitId)
		},
		get panel2Users() {
			if (!this.selectedPermitId) {
				return []
			}

			return (
				this.draftAssignmentsByPermit[this.selectedPermitId] ??
				this.savedUsersForSelectedPermit
			)
		},
		get panel2ActiveUserId() {
			const activeUser = this.panel2Users.find((user) => user.active)

			return activeUser?.userId ?? ""
		},
		get hasSavedUsersForSelectedPermit() {
			return this.savedUsersForSelectedPermit.length > 0
		},
		get isSelectedPermitDirty() {
			return Boolean(
				this.selectedPermitId &&
					this.draftAssignmentsByPermit[this.selectedPermitId],
			)
		},
		get hasDirtyDrafts() {
			return Object.keys(this.draftAssignmentsByPermit).length > 0
		},
		get panel2SubmitLabel() {
			return this.hasSavedUsersForSelectedPermit
				? "Guardar cambios"
				: "Crear asignaciones"
		},
		get eligibleUsers() {
			if (!this.selectedPermit) {
				return []
			}

			const assignedUserIds = new Set(
				this.panel2Users.map((user) => user.userId),
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

			if (!this.discardSelectedPermitDraftIfNeeded()) {
				const selectedCommunity = this.communities.find(
					(community) => community.id === this.selectedCommunityId,
				)

				this.communitySearch = selectedCommunity?.name ?? ""
				return
			}

			this.clearSelectionState()
		},
		selectCommunity(community) {
			if (
				community.id !== this.selectedCommunityId &&
				!this.discardSelectedPermitDraftIfNeeded()
			) {
				return
			}

			this.selectedCommunityId = community.id
			this.communitySearch = community.name
			this.selectedPermitId = ""
			this.selectedUserId = ""
			this.userSearch = ""
			this.isCommunityDropdownOpen = false
			this.isUserDropdownOpen = false
		},
		selectPermit(permit) {
			if (
				this.selectedPermitId &&
				this.selectedPermitId !== permit.id &&
				!this.discardSelectedPermitDraftIfNeeded()
			) {
				return
			}

			if (
				this.selectedPermitId === permit.id &&
				!this.discardSelectedPermitDraftIfNeeded()
			) {
				return
			}

			if (this.selectedPermitId === permit.id) {
				this.clearPermitSelection()
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
		addUserToDraft(user) {
			if (!this.selectedPermitId) {
				return
			}

			const currentUsers = this.ensureDraftForSelectedPermit()
			const hasActiveUser = currentUsers.some(
				(currentUser) => currentUser.active,
			)

			this.writeDraftForSelectedPermit([
				...currentUsers,
				{
					userId: user.id,
					userFullName: user.name,
					active: !hasActiveUser,
					source: "staged",
				},
			])

			this.selectedUserId = ""
			this.userSearch = ""
			this.isUserDropdownOpen = false
		},
		removeDraftUser(userId) {
			if (!this.selectedPermitId) {
				return
			}

			const currentUsers = this.ensureDraftForSelectedPermit()
			const userToRemove = currentUsers.find(
				(currentUser) => currentUser.userId === userId,
			)

			if (!userToRemove) {
				return
			}

			const remainingUsers = currentUsers.filter(
				(currentUser) => currentUser.userId !== userId,
			)

			if (userToRemove.active && remainingUsers.length > 0) {
				remainingUsers[0] = {
					...remainingUsers[0],
					active: true,
				}
			}

			this.writeDraftForSelectedPermit(remainingUsers)
		},
		setDraftUserActive(userId) {
			if (!this.selectedPermitId) {
				return
			}

			const currentUsers = this.ensureDraftForSelectedPermit()

			this.writeDraftForSelectedPermit(
				currentUsers.map((currentUser) => ({
					...currentUser,
					active: currentUser.userId === userId,
				})),
			)
		},
		permitAssignedUsersCount(permit) {
			const draftUsers = this.draftAssignmentsByPermit[permit.id]

			if (draftUsers) {
				return draftUsers.length
			}

			const card = this.assignmentCards.find(
				(currentCard) => currentCard.permitId === permit.id,
			)

			return card?.users.length ?? 0
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
		discardSelectedPermitDraftIfNeeded() {
			if (!this.isSelectedPermitDirty) {
				return true
			}

			const shouldDiscard = window.confirm(
				"Hay cambios sin guardar en este permiso. Si continuas, se perderan.",
			)

			if (shouldDiscard && this.selectedPermitId) {
				delete this.draftAssignmentsByPermit[this.selectedPermitId]
			}

			return shouldDiscard
		},
		clearSelectionState() {
			this.selectedCommunityId = ""
			this.clearPermitSelection()
		},
		clearPermitSelection() {
			this.selectedPermitId = ""
			this.selectedUserId = ""
			this.userSearch = ""
			this.isUserDropdownOpen = false
		},
		getSavedUsersForPermit(permitId) {
			if (!permitId) {
				return []
			}

			const card = this.assignmentCards.find(
				(currentCard) => currentCard.permitId === permitId,
			)

			return (
				card?.users.map((user) => ({
					...user,
					source: "saved",
				})) ?? []
			)
		},
		ensureDraftForSelectedPermit() {
			const existingDraft =
				this.draftAssignmentsByPermit[this.selectedPermitId]

			if (existingDraft) {
				return existingDraft
			}

			const savedUsers = this.getSavedUsersForPermit(
				this.selectedPermitId,
			)

			this.draftAssignmentsByPermit[this.selectedPermitId] = savedUsers

			return savedUsers
		},
		writeDraftForSelectedPermit(users) {
			if (!this.selectedPermitId) {
				return
			}

			this.draftAssignmentsByPermit[this.selectedPermitId] = users
		},
	}
}

window.assignmentPageState = assignmentPageState
