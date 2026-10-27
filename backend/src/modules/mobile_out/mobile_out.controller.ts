import type { Request, Response } from "express"

import { MobileAuthError } from "../mobile-auth/mobile_auth.errors"
import {
	getMobileUserPermit,
	listMobileUserPermits,
} from "./mobile_out.service"

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

		console.error("Failed to load mobile permits", error)
		res.status(500).json({
			ok: false,
			error: "Error interno del servidor",
		})
	}
}

export async function getMobilePermit(
	req: Request<{ permitId: string }>,
	res: Response,
) {
	try {
		const result = await getMobileUserPermit(
			req.params.permitId,
			req.headers.authorization,
		)

		if (!result) {
			res.status(404).json({
				ok: false,
				error: "El permiso no existe o no está asignado",
			})
			return
		}

		res.status(200).json({ ok: true, data: result })
	} catch (error) {
		if (error instanceof MobileAuthError) {
			res.status(401).json({ ok: false, error: error.message })
			return
		}

		console.error("Failed to load mobile permit", error)
		res.status(500).json({
			ok: false,
			error: "Error interno del servidor",
		})
	}
}
