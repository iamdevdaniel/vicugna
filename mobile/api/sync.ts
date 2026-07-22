import type { SyncFieldData } from "@definitions/types"

type SyncFieldResponse = {
	ok: boolean
	data?: {
		permitId: string
		validated: boolean
		dryRun: boolean
	}
	error?: string
}

const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL

if (!apiBaseUrl) {
	throw new Error("Missing EXPO_PUBLIC_API_BASE_URL")
}

export async function submitSyncFieldData(
	token: string,
	data: SyncFieldData,
) {
	const response = await fetch(`${apiBaseUrl}/permits/sync`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(data),
	})

	const payload = (await response.json()) as SyncFieldResponse

	if (!response.ok || !payload.ok || !payload.data) {
		throw new Error(payload.error ?? "No se pudo enviar el permiso")
	}

	return payload.data
}
