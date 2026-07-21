import { Router } from "express"

import { listMobilePermits } from "./permits/permits.controller"

export const mobileClientRoutes = Router()

mobileClientRoutes.get("/permits", listMobilePermits)
