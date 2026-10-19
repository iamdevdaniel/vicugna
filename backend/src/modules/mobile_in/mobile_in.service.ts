import { getMobileUserFromAuthorization } from "../mobile-auth/mobile_auth.service"
import { PermitValidationError } from "./mobile_in.errors"
import { getPayloadPermitIdForLog, parseSyncPayload } from "./mobile_in.payload"
import { saveSyncFieldData } from "./mobile_in.repository"

export async function submitSyncFieldData(
	payload: unknown,
	authorizationHeader: string,
) {
	const user = await getMobileUserFromAuthorization(authorizationHeader)

	try {
		const data = parseSyncPayload(payload)
		return saveSyncFieldData(data, user.id)
	} catch (error) {
		if (error instanceof PermitValidationError) {
			console.error("Mobile sync payload validation failed", {
				at: new Date().toISOString(),
				userId: user.id,
				permitId: getPayloadPermitIdForLog(payload),
				code: error.code,
				message: error.message,
				details: error.logDetails,
			})
		}

		throw error
	}
}
