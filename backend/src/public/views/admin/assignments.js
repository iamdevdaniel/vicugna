function assignmentsPage(initialData) {
	return {
		seasons: initialData.seasons,
		communities: initialData.communities,
		users: initialData.users,
		selectedSeasonId: initialData.selectedSeasonId,
		isCommunityPickerOpen: false,
		communitySearch: "",
		selectedCommunityId: "",
		selectedCommunityName: "",
		isUserPickerOpen: false,
		userSearch: "",
		selectedUserId: "",
		selectedUserName: "",
		get filteredCommunities() {
			const search = this.communitySearch.trim().toLowerCase()

			if (!search) return this.communities.slice(0, 8)

			return this.communities
				.filter((community) => community.name.toLowerCase().includes(search))
				.slice(0, 8)
		},
		get filteredUsers() {
			const search = this.userSearch.trim().toLowerCase()

			if (!search) return this.users.slice(0, 8)

			return this.users
				.filter((user) => user.name.toLowerCase().includes(search))
				.slice(0, 8)
		},
		selectCommunity(community) {
			this.selectedCommunityId = community.id
			this.selectedCommunityName = community.name
			this.communitySearch = community.name
			this.isCommunityPickerOpen = false
		},
		clearCommunity() {
			this.selectedCommunityId = ""
			this.selectedCommunityName = ""
			this.communitySearch = ""
			this.isCommunityPickerOpen = false
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
