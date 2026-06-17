import { Router } from "express"

import { renderAdminLogin, renderMissionControl } from "./admin.controller"

export const adminRoutes = Router()

adminRoutes.get("/login", renderAdminLogin)
adminRoutes.get("/mission-control", renderMissionControl)
