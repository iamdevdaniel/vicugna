import { Router } from "express"
import { assignmentRoutes } from "../assignments/assignment.routes"
import { monitoringRoutes } from "../monitoring/monitoring.routes"
import { userRoutes } from "../users/user.routes"

import {
	loginAdmin,
	logoutAdmin,
	renderAdminLogin,
	renderMissionControl,
} from "./admin.controller"
import { requireAdminSession } from "./admin.middleware"

export const adminRoutes = Router()

adminRoutes.get("/login", renderAdminLogin)
adminRoutes.post("/login", loginAdmin)
adminRoutes.post("/logout", logoutAdmin)
adminRoutes.get("/mission-control", requireAdminSession, renderMissionControl)
adminRoutes.use("/users", requireAdminSession, userRoutes)
adminRoutes.use("/assignments", requireAdminSession, assignmentRoutes)
adminRoutes.use("/monitoring", requireAdminSession, monitoringRoutes)
