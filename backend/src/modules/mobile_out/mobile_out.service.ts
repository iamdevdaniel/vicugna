import { getMobileUserFromAuthorization } from "../mobile-auth/mobile_auth.service"
import {
	getMobilePermitByUserId,
	listMobilePermitsByUserId,
} from "./mobile_out.repository"
import type { MobilePermitData } from "./mobile_out.types"

export async function listMobileUserPermits(
	authorizationHeader?: string,
): Promise<MobilePermitData[]> {
	const user = await getMobileUserFromAuthorization(authorizationHeader)

	return listMobilePermitsByUserId(user.id)
}

export async function getMobileUserPermit(
	permitId: string,
	authorizationHeader?: string,
): Promise<MobilePermitData | null> {
	const user = await getMobileUserFromAuthorization(authorizationHeader)

	return getMobilePermitByUserId(user.id, permitId)
}
