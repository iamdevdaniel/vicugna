import { Router } from "express"

import {
	createManagedUser,
	renderPasswordSuggestion,
	renderUsersPage,
} from "./user.controller"

export const userRoutes = Router()

userRoutes.get("/", renderUsersPage)
userRoutes.get("/password-suggestion", renderPasswordSuggestion)
userRoutes.post("/", createManagedUser)
