import { Router } from "express"
import {
	renderMonitoringPage,
	submitPermitReopen,
} from "./monitoring.controller"

export const monitoringRoutes = Router()

monitoringRoutes.get("/", renderMonitoringPage)
monitoringRoutes.post("/reopen", submitPermitReopen)
