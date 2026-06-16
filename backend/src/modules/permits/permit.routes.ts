import { Router } from "express"
import { syncPermit } from "./permit.controller"

export const permitRoutes = Router()

permitRoutes.post("/sync", syncPermit)
