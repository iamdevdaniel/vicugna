import { Router } from "express"

import { createManagedUser, renderUsersPage } from "./user.controller"

export const userRoutes = Router()

userRoutes.get("/", renderUsersPage)
userRoutes.post("/", createManagedUser)
