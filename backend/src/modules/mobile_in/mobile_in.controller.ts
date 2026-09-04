import type { Request, Response } from "express"
import { MobileAuthError } from "../mobile-auth/mobile_auth.errors"
import {
	PermitNotFoundError,
	PermitSyncConflictError,
	PermitSyncForbiddenError,
	PermitValidationError,
} from "./mobile_in.errors"
import { submitSyncFieldData } from "./mobile_in.service"
export async function syncPermit(
	req: Request<Record<string, never>, Record<string, never>, unknown>,
	res: Response,
) {
	try {
		const authorizationHeader = req.headers.authorization
		if (!authorizationHeader) {
			throw new MobileAuthError("Token faltante")
		}

		const result = await submitSyncFieldData(req.body, authorizationHeader)
		res.status(200).json({
			ok: true,
			data: result,
		})
	} catch (error) {
		if (error instanceof MobileAuthError) {
			res.status(401).json({ ok: false, error: error.message })
			return
		}

		if (error instanceof PermitValidationError) {
			res.status(400).json({
				ok: false,
				error: error.message,
				code: error.code,
				fields: error.code === "PRSG" ? error.fields : undefined,
			})
			return
		}

		if (error instanceof PermitNotFoundError) {
			res.status(404).json({
				ok: false,
				error: error.message,
			})
			return
		}

		if (error instanceof PermitSyncForbiddenError) {
			res.status(403).json({ ok: false, error: error.message })
			return
		}

		if (error instanceof PermitSyncConflictError) {
			res.status(409).json({ ok: false, error: error.message })
			return
		}

		console.error("Failed to sync mobile permit", error)
		res.status(500).json({
			ok: false,
			error: "Error interno del servidor",
		})
	}
}
