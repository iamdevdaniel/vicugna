import type { Request, Response } from "express"
import { syncPermitData } from "./permit.service"
import type { PermitSyncData } from "./permit.types"

export async function syncPermit(
	req: Request<Record<string, never>, Record<string, never>, PermitSyncData>,
	res: Response,
) {
	try {
		const result = await syncPermitData(req.body)
		res.status(200).json({
			ok: true,
			data: result,
		})
	} catch (error) {
		res.status(400).json({
			ok: false,
			error:
				error instanceof Error ? error.message : "Invalid permit data",
		})
	}
}
