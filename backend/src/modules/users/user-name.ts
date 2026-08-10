import type { UserName } from "./user.types"

export function getUserFullName(user: UserName) {
	return `${user.firstName} ${user.paternalLastName} ${user.maternalLastName}`
}

export function compareUserNames(left: UserName, right: UserName) {
	return (
		left.paternalLastName.localeCompare(right.paternalLastName) ||
		left.maternalLastName.localeCompare(right.maternalLastName) ||
		left.firstName.localeCompare(right.firstName)
	)
}
