// Handles failures while the mobile app communicates with the backend.

import { getNetworkStateAsync } from "expo-network"

type ServerResponse<T> = {
	ok: boolean
	data?: T
	error?: string
	code?: string
	fields?: string[]
}

export type BackendRequestFailure =
	| "offline"
	| "timeout"
	| "unreachable"
	| "invalid_response"
	| "rejected"
	| "unexpected"

export class BackendRequestError extends Error {
	constructor(
		readonly failure: BackendRequestFailure,
		message: string,
		readonly code?: string,
		readonly fields?: string[],
	) {
		super(message)
		this.name = "BackendRequestError"
	}
}

const apiBaseUrl = process.env.EXPO_PUBLIC_BACKEND_URL
const requestTimeoutMs = 95_000

if (!apiBaseUrl) {
	throw new Error("Falta configurar la dirección del servidor")
}

export async function requestBackend<T>(
	path: string,
	options: RequestInit,
	fallbackError: string,
): Promise<T> {
	if (await isOffline()) {
		throw new BackendRequestError(
			"offline",
			"Sin conexión a internet. Intente nuevamente cuando recupere la conexión.",
		)
	}

	const controller = new AbortController()
	const timeout = setTimeout(() => controller.abort(), requestTimeoutMs)
	let response: Response

	try {
		response = await fetch(`${apiBaseUrl}${path}`, {
			...options,
			signal: controller.signal,
		})
	} catch (error) {
		if (error instanceof Error && error.name === "AbortError") {
			throw new BackendRequestError(
				"timeout",
				"El servidor tardó demasiado en responder. Intente nuevamente.",
			)
		}

		if (error instanceof TypeError) {
			if (await isOffline()) {
				throw new BackendRequestError(
					"offline",
					"Sin conexión a internet. Intente nuevamente cuando recupere la conexión.",
				)
			}

			throw new BackendRequestError(
				"unreachable",
				"No se pudo conectar con el servidor. Intente más tarde.",
			)
		}

		throw new BackendRequestError(
			"unexpected",
			"Ocurrió un error al comunicarse con el servidor.",
		)
	} finally {
		clearTimeout(timeout)
	}

	let payload: ServerResponse<T>

	try {
		payload = (await response.json()) as ServerResponse<T>
	} catch {
		throw new BackendRequestError(
			"invalid_response",
			"El servidor devolvió una respuesta inválida. Intente nuevamente.",
		)
	}

	if (!response.ok || !payload.ok) {
		const message = response.status >= 500 ? fallbackError : payload.error
		throw new BackendRequestError(
			"rejected",
			message ?? fallbackError,
			payload.code,
			payload.fields,
		)
	}

	if (payload.data === undefined) {
		throw new BackendRequestError(
			"invalid_response",
			"El servidor devolvió una respuesta inválida. Intente nuevamente.",
		)
	}

	return payload.data
}

async function isOffline() {
	try {
		const network = await getNetworkStateAsync()
		return (
			network.isConnected === false ||
			network.isInternetReachable === false
		)
	} catch {
		return false
	}
}
