import { isDatabaseConnectionError } from "../../config"
import { PermitExportUnavailableError } from "../../modules/exports/export.errors"
import { generatePermitReportsArchive } from "../../modules/exports/export.service"
import { requireAdminSession } from "../admin-auth.server"
import type { Route } from "./+types/export-reports"

export async function loader({ params, context }: Route.LoaderArgs) {
	requireAdminSession(context)

	try {
		const { buffer, fileName } = await generatePermitReportsArchive(
			params.permitId,
		)
		return new Response(new Uint8Array(buffer), {
			headers: {
				"Cache-Control": "no-store",
				"Content-Disposition": getContentDisposition(fileName),
				"Content-Type": "application/zip",
			},
		})
	} catch (error) {
		if (error instanceof PermitExportUnavailableError) {
			return new Response("El permiso no tiene reportes disponibles", {
				status: 404,
			})
		}
		if (isDatabaseConnectionError(error)) {
			return new Response(
				"Base de datos no disponible. Intenta de nuevo en un momento.",
				{ status: 503 },
			)
		}
		console.error("Admin report generation failed", error)
		return new Response("No se pudo generar el reporte", { status: 500 })
	}
}

function getContentDisposition(fileName: string) {
	return `attachment; filename="reportes.zip"; filename*=UTF-8''${encodeURIComponent(fileName)}`
}
