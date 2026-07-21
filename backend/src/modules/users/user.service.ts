import bcrypt from "bcrypt"
import {
	getPostgresConstraintName,
	POSTGRES_ERROR_CODES,
} from "../../db/errors"

import { UserManagementError } from "./user.errors"
import { createUser, listUsers } from "./user.repository"
import type { CreateUserFormData, UserListItem } from "./user.types"

const PASSWORD_WORDS = [
	"alpaca",
	"brisa",
	"campo",
	"cerro",
	"fibra",
	"llama",
	"nube",
	"pampa",
	"sol",
	"viento",
] as const

export async function getUsersPageState(): Promise<{
	users: UserListItem[]
	suggestedPassword: string
}> {
	return {
		users: await listUsers(),
		suggestedPassword: getSuggestedTemporaryPassword(),
	}
}

export function getSuggestedTemporaryPassword() {
	const firstWord = pickPasswordWord()
	const secondWord = pickPasswordWord()
	const number = (crypto.getRandomValues(new Uint32Array(1))[0] % 90) + 10

	return `${firstWord}-${secondWord}-${number}`
}

export async function registerUser(data: CreateUserFormData) {
	const fullName = data.fullName.trim()
	const phoneNumber = data.phoneNumber.trim()
	const email = normalizeEmail(data.email)
	const password = data.password.trim()

	if (!fullName || !phoneNumber || !password) {
		throw new UserManagementError(
			"Nombre, telefono y contrasena son obligatorios",
		)
	}

	try {
		await createUser({
			id: crypto.randomUUID(),
			fullName,
			phoneNumber,
			email,
			passwordHash: await bcrypt.hash(password, 12),
			role: "user",
			isActive: true,
			avatarSeed: `vicugna-${crypto.randomUUID()}`,
		})
	} catch (error) {
		throwUserCreationError(error)
	}
}

function normalizeEmail(email: string) {
	const cleanEmail = email.trim().toLowerCase()
	return cleanEmail || null
}

function pickPasswordWord() {
	const index =
		crypto.getRandomValues(new Uint32Array(1))[0] % PASSWORD_WORDS.length
	return PASSWORD_WORDS[index]
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
