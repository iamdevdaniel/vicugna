import { resolve } from "node:path"

export const adminAuthFile = resolve(__dirname, ".auth/admin.json")

export function getAdminCredentials() {
	const email = process.env.E2E_ADMIN_EMAIL?.trim()
	const password = process.env.E2E_ADMIN_PASSWORD?.trim()

	if (!email || !password) {
		throw new Error(
			"E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD are required for authenticated admin tests",
		)
	}

	return { email, password }
}
