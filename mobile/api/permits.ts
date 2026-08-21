import type { MobilePermitData } from "@definitions/types"
import { requestBackend } from "./backend-request"

export async function fetchPermits(token: string) {
	return requestBackend<MobilePermitData[]>(
		"/mobile/permits",
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
		"No se pudieron cargar los permisos",
	)
}
