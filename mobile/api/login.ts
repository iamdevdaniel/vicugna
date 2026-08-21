import type { MobileLoginResponseData } from "@definitions/types"
import { requestBackend } from "./backend-request"

export async function login(email: string, password: string) {
	return requestBackend<MobileLoginResponseData>(
		"/mobile/auth/login",
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: email.trim(),
				password,
			}),
		},
		"No se pudo iniciar sesión",
	)
}
