import { type APIRequestContext, expect } from "@playwright/test"
import type { MobilePermitData, SyncFieldData } from "@shared"
import { getPermitDataHash } from "../../src/modules/permit-sync/permit-data-hash"

export async function login(
	request: APIRequestContext,
	email = "lucia.choque@gmail.com",
	password = "e2e-lucia-password",
) {
	const response = await request.post("/mobile/auth/login", {
		data: { email, password },
	})
	expect(response.ok()).toBe(true)
	const body = (await response.json()) as {
		ok: true
		data: { token: string }
	}
	return body.data.token
}

export function authorization(token: string) {
	return { Authorization: `Bearer ${token}` }
}

export async function downloadPermit(
	request: APIRequestContext,
	token: string,
	permitId: string,
) {
	const response = await request.get(`/mobile/permits/${permitId}`, {
		headers: authorization(token),
	})
	expect(response.status()).toBe(200)
	const body = (await response.json()) as {
		ok: true
		data: MobilePermitData
	}
	expect(body.data.serverHash).toBe(getPermitDataHash(body.data.fieldData))
	return body.data
}

export function sendPermit(
	request: APIRequestContext,
	token: string,
	payload: SyncFieldData,
) {
	return request.post("/permits/sync", {
		headers: authorization(token),
		data: payload,
	})
}
