import { getMobileUserFromAuthorization } from "../../mobile-auth/mobile_auth.service"
import { listMobilePermitsByUserId } from "./permits.repository"
import type { MobilePermitData } from "./permits.types"

export async function listMobileUserPermits(
	authorizationHeader?: string,
): Promise<MobilePermitData[]> {
	const user = await getMobileUserFromAuthorization(authorizationHeader)

	return listMobilePermitsByUserId(user.id)
}
