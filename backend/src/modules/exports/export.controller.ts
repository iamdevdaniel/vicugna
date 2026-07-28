import type { Request, Response } from "express"
import { generatePermitReportsArchive } from "./export.service"

export async function downloadPermitReports(
	req: Request<{ permitId: string }>,
	res: Response,
) {
	try {
		const { buffer, fileName } = await generatePermitReportsArchive(
			req.params.permitId,
		)

		res.setHeader("Content-Type", "application/zip")
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="${fileName}"`,
		)
		res.send(buffer)
	} catch (error) {
		console.error(error)
		res.status(404).send("No se pudo generar el reporte")
	}
}
