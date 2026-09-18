import backendPackage from "../../package.json"
import { env } from "../config"

export function getAdminAppInfo() {
	return {
		version: backendPackage.version,
		environment: env.nodeEnv === "production" ? "Producción" : "Desarrollo",
	}
}
