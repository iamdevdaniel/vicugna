import type { Request, Response } from "express"

import { MobileAuthError } from "../../mobile-auth/mobile_auth.errors"
import { listMobileUserPermits } from "./permits.service"

export async function listMobilePermits(req: Request, res: Response) {
	try {
		const result = await listMobileUserPermits(req.headers.authorization)

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
