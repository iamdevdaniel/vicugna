import type { MobilePermitData } from "@definitions/types"

type MobilePermitsResponse = {
	ok: boolean
	data?: MobilePermitData[]
	error?: string
}

const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL

if (!apiBaseUrl) {
	throw new Error("Falta configurar la dirección del servidor")
}

export async function fetchPermits(token: string) {
	const response = await fetch(`${apiBaseUrl}/mobile/permits`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})

	const payload = (await response.json()) as MobilePermitsResponse

	if (!response.ok || !payload.ok || !payload.data) {
		throw new Error(payload.error ?? "No se pudieron cargar los permisos")
	}

	return payload.data
}
