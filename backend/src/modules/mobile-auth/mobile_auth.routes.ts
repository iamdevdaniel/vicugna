import { Router } from "express"

import { loginMobile } from "./mobile_auth.controller"

export const mobileAuthRoutes = Router()

mobileAuthRoutes.post("/login", loginMobile)
