import { Router } from "express"

import { listMobilePermits } from "./mobile_out.controller"

export const mobileOutRoutes = Router()

mobileOutRoutes.get("/permits", listMobilePermits)
