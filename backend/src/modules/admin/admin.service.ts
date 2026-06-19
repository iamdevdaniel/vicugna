import bcrypt from "bcrypt"

import { AdminAuthError } from "./admin.errors"
import { findUserByEmail } from "./admin.repository"
import type { AdminSessionUser, LoginFormData } from "./admin.types"

export async function authenticateAdmin(
	data: LoginFormData,
): Promise<AdminSessionUser> {
	const email = data.email.trim().toLowerCase()
	const password = data.password.trim()

	if (!email || !password) {
		throw new AdminAuthError("Correo y contraseña son obligatorios")
	}

	const user = await findUserByEmail(email)

	if (!user?.isActive) {
		throw new AdminAuthError("Credenciales invalidas")
	}

	if (user.role !== "admin") {
		throw new AdminAuthError("Se requiere acceso de administrador")
	}

	const isValidPassword = await bcrypt.compare(password, user.passwordHash)

	if (!isValidPassword) {
		throw new AdminAuthError("Credenciales invalidas")
	}

	return {
		id: user.id,
		email: user.email ?? email,
		fullName: user.fullName,
		role: "admin",
	}
}
