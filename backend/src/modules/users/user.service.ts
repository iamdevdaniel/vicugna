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
	const firstName = normalizeRequiredText(data.firstName)
	const paternalLastName = normalizeRequiredText(data.paternalLastName)
	const maternalLastName = normalizeRequiredText(data.maternalLastName)
	const phoneNumber = normalizeRequiredText(data.phoneNumber)
	const email = normalizeEmail(data.email)
	const password = normalizeRequiredText(data.password)

	if (
		!firstName ||
		!paternalLastName ||
		!maternalLastName ||
		!phoneNumber ||
		!password
	) {
		throw new UserManagementError(
			"Nombres, apellidos, teléfono y contraseña son obligatorios",
		)
	}

	try {
		await createUser({
			id: crypto.randomUUID(),
			firstName,
			paternalLastName,
			maternalLastName,
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

function normalizeRequiredText(value: unknown) {
	return typeof value === "string" ? value.trim() : ""
}

function normalizeEmail(email: unknown) {
	const cleanEmail = normalizeRequiredText(email).toLowerCase()
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
