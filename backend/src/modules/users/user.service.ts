import bcrypt from "bcrypt"
import {
	getPostgresConstraintName,
	POSTGRES_ERROR_CODES,
} from "../../db/errors"

import { UserManagementError } from "./user.errors"
import { createUser, listUsers } from "./user.repository"
import type {
	CreateUserFormData,
	ManagedUserRole,
	UserListItem,
} from "./user.types"

const DEFAULT_AVATAR_STYLE = "marble"

export async function getUsersPageState(): Promise<{
	users: UserListItem[]
}> {
	return {
		users: await listUsers(),
	}
}

export async function registerUser(data: CreateUserFormData) {
	const role = parseUserRole(data.role)
	const fullName = data.fullName.trim()
	const phoneNumber = data.phoneNumber.trim()
	const email = normalizeEmail(data.email)
	const password = data.password.trim()

	if (!fullName || !phoneNumber || !password) {
		throw new UserManagementError(
			"Nombre, telefono y contrasena son obligatorios",
		)
	}

	if (role === "admin" && !email) {
		throw new UserManagementError("Un administrador necesita correo")
	}

	try {
		await createUser({
			id: crypto.randomUUID(),
			fullName,
			phoneNumber,
			email,
			passwordHash: await bcrypt.hash(password, 12),
			role,
			isActive: true,
			avatarSeed: `vicugna-${crypto.randomUUID()}`,
			avatarStyle: DEFAULT_AVATAR_STYLE,
		})
	} catch (error) {
		throwUserCreationError(error)
	}
}

function parseUserRole(role: string): ManagedUserRole {
	if (role === "admin" || role === "user") {
		return role
	}

	throw new UserManagementError("Rol invalido")
}

function normalizeEmail(email: string) {
	const cleanEmail = email.trim().toLowerCase()
	return cleanEmail || null
}

function throwUserCreationError(error: unknown): never {
	const messageByConstraint: Record<string, string> = {
		users_email_unique: "Ese correo ya existe",
		users_phone_number_unique: "Ese telefono ya existe",
	}
	const constraint = getPostgresConstraintName(
		error,
		POSTGRES_ERROR_CODES.uniqueViolation,
	)

	if (constraint && messageByConstraint[constraint]) {
		throw new UserManagementError(messageByConstraint[constraint])
	}

	throw error
}
