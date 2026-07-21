import bcrypt from "bcrypt"

import { MobileAuthError } from "./mobile_auth.errors"
import {
	findMobileUserByEmail,
	findMobileUserById,
} from "./mobile_auth.repository"
import {
	createMobileAuthToken,
	verifyMobileAuthToken,
} from "./mobile_auth.token"
import type {
	MobileLoginRequestBody,
	MobileLoginResult,
	MobileSessionUser,
} from "./mobile_auth.types"

export async function loginMobileUser(
	data: MobileLoginRequestBody,
): Promise<MobileLoginResult> {
	const email = data.email.trim().toLowerCase()
	const password = data.password.trim()

	if (!email || !password) {
		throw new MobileAuthError("Correo y contraseña son obligatorios")
	}

	const user = await findMobileUserByEmail(email)

	if (!user?.isActive || user.role !== "user") {
		throw new MobileAuthError("Credenciales inválidas")
	}

	const isValidPassword = await bcrypt.compare(password, user.passwordHash)

	if (!isValidPassword) {
		throw new MobileAuthError("Credenciales invalidas")
	}

	const sessionUser: MobileSessionUser = {
		id: user.id,
		email: user.email ?? email,
		fullName: user.fullName,
		role: "user",
		avatarSeed: user.avatarSeed,
	}
	const { token, expiresAt } = createMobileAuthToken(sessionUser)

	return {
		token,
		expiresAt,
		user: sessionUser,
	}
}

export async function getMobileUserFromAuthorization(
	authorizationHeader?: string,
) {
	const token = getBearerToken(authorizationHeader)
	const payload = verifyMobileAuthToken(token)
	const user = await findMobileUserById(payload.sub)

	if (!user?.isActive || user.role !== "user") {
		throw new MobileAuthError("Credenciales inválidas")
	}

	return user
}

function getBearerToken(authorizationHeader?: string) {
	if (!authorizationHeader) {
		throw new MobileAuthError("Token faltante")
	}

	const [scheme, token] = authorizationHeader.split(" ")

	if (scheme !== "Bearer" || !token) {
		throw new MobileAuthError("Token invalido")
	}

	return token
}
