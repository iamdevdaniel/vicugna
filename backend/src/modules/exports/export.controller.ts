import type { Request, Response } from "express"
import { generateParticipantsRegisterExport } from "./export.service"

export async function downloadParticipantsRegister(
	req: Request<{ permitId: string }>,
	res: Response,
) {
	try {
		const { buffer, fileName } = await generateParticipantsRegisterExport(
			req.params.permitId,
		)

		res.setHeader(
			"Content-Type",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		)
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
