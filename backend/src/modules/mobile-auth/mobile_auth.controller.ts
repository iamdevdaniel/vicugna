import type { Request, Response } from "express"

import { MobileAuthError } from "./mobile_auth.errors"
import { loginMobileUser } from "./mobile_auth.service"
import type { MobileLoginRequestBody } from "./mobile_auth.types"

export async function loginMobile(
	req: Request<
		Record<string, never>,
		Record<string, never>,
		MobileLoginRequestBody
	>,
	res: Response,
) {
	try {
		const result = await loginMobileUser(req.body)

		res.status(200).json({
			ok: true,
			data: result,
		})
	} catch (error) {
		if (error instanceof MobileAuthError) {
			res.status(401).json({
				ok: false,
				error: error.message,
			})
			return
		}

		res.status(500).json({
			ok: false,
			error:
				error instanceof Error
					? error.message
					: "Internal server error",
		})
	}
}
