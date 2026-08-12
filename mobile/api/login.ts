import type { MobileLoginResponseData } from "@definitions/types"

type MobileLoginResponse = {
	ok: boolean
	data?: MobileLoginResponseData
	error?: string
}

const apiBaseUrl = process.env.EXPO_PUBLIC_BACKEND_URL

if (!apiBaseUrl) {
	throw new Error("Falta configurar la dirección del servidor")
}

export async function login(email: string, password: string) {
	const response = await fetch(`${apiBaseUrl}/mobile/auth/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			email: email.trim(),
			password,
		}),
	})

	const payload = (await response.json()) as MobileLoginResponse

	if (!response.ok || !payload.ok || !payload.data) {
		throw new Error(payload.error ?? "No se pudo iniciar sesión")
	}

	return payload.data
}
