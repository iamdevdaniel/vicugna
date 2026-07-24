import { Router } from "express"
import { syncPermit } from "./mobile_in.controller"

export const mobileInRoutes = Router()

mobileInRoutes.post("/sync", syncPermit)
