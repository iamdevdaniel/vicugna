function assignmentSeasonState(initialData) {
	return {
		permits: initialData.permits,
		permitSearch: "",
		selectedPermitId: initialData.selectedPermit?.id ?? "",
		selectedSeasonId: initialData.selectedSeasonId,
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
		},
	}
}

function assignmentCommunityPicker(initialData) {
	return {
		communities: initialData.communities,
		isCommunityPickerOpen: false,
		communitySearch: "",
		selectedCommunityId: "",
		get filteredCommunities() {
			const search = this.communitySearch.trim().toLowerCase()

			if (!search) return this.communities.slice(0, 8)

			return this.communities
				.filter((community) => community.name.toLowerCase().includes(search))
				.slice(0, 8)
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
	}
}

function assignmentUserPicker(initialData) {
	return {
		users: initialData.users,
		isUserPickerOpen: false,
		userSearch: "",
		selectedUserId: "",
		selectedUserName: "",
		get filteredUsers() {
			const search = this.userSearch.trim().toLowerCase()

			if (!search) return this.users.slice(0, 8)

			return this.users
				.filter((user) => user.name.toLowerCase().includes(search))
				.slice(0, 8)
		},
		selectUser(user) {
			this.selectedUserId = user.id
			this.selectedUserName = user.name
			this.userSearch = user.name
			this.isUserPickerOpen = false
		},
		clearUser() {
			this.selectedUserId = ""
			this.selectedUserName = ""
			this.userSearch = ""
			this.isUserPickerOpen = false
		},
	}
}
