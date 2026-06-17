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
		throw new AdminAuthError("Email and password are required")
	}

	const user = await findUserByEmail(email)

	if (!user?.isActive) {
		throw new AdminAuthError("Invalid credentials")
	}

	if (user.role !== "admin") {
		throw new AdminAuthError("Admin access required")
	}

	const isValidPassword = await bcrypt.compare(password, user.passwordHash)

	if (!isValidPassword) {
		throw new AdminAuthError("Invalid credentials")
	}

	return {
		id: user.id,
		email: user.email,
		fullName: user.fullName,
		role: "admin",
	}
}
