import { Router } from "express"
import { downloadPermitReports } from "./export.controller"

export const exportRoutes = Router()

exportRoutes.get("/reports/:permitId", downloadPermitReports)
