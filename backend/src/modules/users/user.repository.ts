import { db } from "@db"

import { users } from "../../db/schema"
import type { ManagedUserRole, UserListItem, UserName } from "./user.types"
import { getUserFullName } from "./user-name"

interface CreateUserRecord extends UserName {
	id: string
	phoneNumber: string
	email: string | null
	passwordHash: string
	role: ManagedUserRole
	isActive: boolean
	avatarSeed: string
}

export async function listUsers(): Promise<UserListItem[]> {
	const rows = await db.query.users.findMany({
		orderBy: (table, { asc }) => [
			asc(table.paternalLastName),
			asc(table.maternalLastName),
			asc(table.firstName),
		],
	})

	return rows.map((user) => ({
		id: user.id,
		fullName: getUserFullName(user),
		phoneNumber: user.phoneNumber,
		email: user.email,
		role: normalizeUserRole(user.role),
		isActive: user.isActive,
		avatarSeed: user.avatarSeed,
	}))
}

export async function createUser(record: CreateUserRecord) {
	await db.insert(users).values(record)
}

function normalizeUserRole(role: string): ManagedUserRole {
	return role === "admin" ? "admin" : "user"
}
