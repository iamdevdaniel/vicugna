import crypto from "node:crypto"
import { env } from "@config"

import { MobileAuthError } from "./mobile_auth.errors"
import type {
	MobileAuthTokenPayload,
	MobileSessionUser,
} from "./mobile_auth.types"

const MOBILE_TOKEN_LFSPAN = 90

export function createMobileAuthToken(user: MobileSessionUser) {
	const expiresAt = new Date()
	expiresAt.setDate(expiresAt.getDate() + MOBILE_TOKEN_LFSPAN)

	const payload: MobileAuthTokenPayload = {
		sub: user.id,
		role: user.role,
		exp: Math.floor(expiresAt.getTime() / 1000),
	}

	return {
		token: signPayload(payload),
		expiresAt: expiresAt.toISOString(),
	}
}

export function verifyMobileAuthToken(token: string): MobileAuthTokenPayload {
	const [encodedPayload, signature] = token.split(".")

	if (!encodedPayload || !signature) {
		throw new MobileAuthError("Token invalido")
	}

	const expectedSignature = sign(encodedPayload)

	if (
		signature.length !== expectedSignature.length ||
		!crypto.timingSafeEqual(
			Buffer.from(signature),
			Buffer.from(expectedSignature),
		)
	) {
		throw new MobileAuthError("Token invalido")
	}

	const payload = JSON.parse(
		Buffer.from(encodedPayload, "base64url").toString("utf8"),
	) as MobileAuthTokenPayload

	if (payload.exp * 1000 <= Date.now()) {
		throw new MobileAuthError("Token expirado")
	}

	return payload
}

function signPayload(payload: MobileAuthTokenPayload) {
	const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
		"base64url",
	)

	return `${encodedPayload}.${sign(encodedPayload)}`
}

function sign(value: string) {
	return crypto
		.createHmac("sha256", env.mobileAuthSecret)
		.update(value)
		.digest("base64url")
}
