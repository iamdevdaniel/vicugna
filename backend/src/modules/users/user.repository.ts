import { db } from "@db"

import { users } from "../../db/schema"
import type { ManagedUserRole, UserListItem } from "./user.types"

interface CreateUserRecord {
	id: string
	fullName: string
	phoneNumber: string
	email: string | null
	passwordHash: string
	role: ManagedUserRole
	isActive: boolean
	avatarSeed: string
	avatarStyle: string
}

export async function listUsers(): Promise<UserListItem[]> {
	const rows = await db.query.users.findMany({
		orderBy: (table, { asc }) => [asc(table.fullName)],
	})

	return rows.map((user) => ({
		id: user.id,
		fullName: user.fullName,
		phoneNumber: user.phoneNumber,
		email: user.email,
		role: normalizeUserRole(user.role),
		isActive: user.isActive,
	}))
}

export async function createUser(record: CreateUserRecord) {
	await db.insert(users).values(record)
}

function normalizeUserRole(role: string): ManagedUserRole {
	return role === "admin" ? "admin" : "user"
}
