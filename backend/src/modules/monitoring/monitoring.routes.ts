import { Router } from "express"
import { renderMonitoringPage } from "./monitoring.controller"

export const monitoringRoutes = Router()

monitoringRoutes.get("/", renderMonitoringPage)
