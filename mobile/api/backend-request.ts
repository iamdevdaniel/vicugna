// Handles failures while the mobile app communicates with the backend.

import { mobileRequestErrors } from "@definitions/errors"
import { getNetworkStateAsync } from "expo-network"

type ServerResponse<T> = {
	ok: boolean
	data?: T
	error?: string
	code?: string
}

export class BackendRequestError extends Error {
	constructor(
		readonly code: string,
		message: string,
		readonly status?: number,
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
			mobileRequestErrors.offline.code,
			mobileRequestErrors.offline.message,
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
				mobileRequestErrors.timeout.code,
				mobileRequestErrors.timeout.message,
			)
		}

		if (error instanceof TypeError) {
			throw new BackendRequestError(
				mobileRequestErrors.unreachable.code,
				mobileRequestErrors.unreachable.message,
			)
		}

		throw new BackendRequestError(
			mobileRequestErrors.unexpected.code,
			mobileRequestErrors.unexpected.message,
		)
	} finally {
		clearTimeout(timeout)
	}

	let payload: ServerResponse<T>

	try {
		payload = (await response.json()) as ServerResponse<T>
	} catch {
		throw new BackendRequestError(
			mobileRequestErrors.invalidResponse.code,
			mobileRequestErrors.invalidResponse.message,
		)
	}
	if (
		!payload ||
		typeof payload !== "object" ||
		typeof payload.ok !== "boolean"
	) {
		throw new BackendRequestError(
			mobileRequestErrors.invalidResponse.code,
			mobileRequestErrors.invalidResponse.message,
		)
	}

	if (!response.ok || !payload.ok) {
		const isServerError = response.status >= 500
		const message = isServerError ? fallbackError : payload.error
		const code = isServerError
			? mobileRequestErrors.serverError.code
			: (payload.code ?? mobileRequestErrors.rejected.code)
		throw new BackendRequestError(
			code,
			message ?? mobileRequestErrors.rejected.message,
			response.status,
		)
	}

	if (payload.data === undefined) {
		throw new BackendRequestError(
			mobileRequestErrors.invalidResponse.code,
			mobileRequestErrors.invalidResponse.message,
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
