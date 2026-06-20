import { Router } from "express"
import { userRoutes } from "../users"

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
