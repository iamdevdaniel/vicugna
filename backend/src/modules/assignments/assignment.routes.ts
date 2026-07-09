import { Router } from "express"
import {
	renderAssignmentPage,
	renderAssignmentSeasonState,
	submitAssignmentForm,
	submitPermitForm,
} from "./assignment.controller"

export const assignmentRoutes = Router()

assignmentRoutes.get("/season-state", renderAssignmentSeasonState)
assignmentRoutes.get("/", renderAssignmentPage)
assignmentRoutes.post("/permits", submitPermitForm)
assignmentRoutes.post("/", submitAssignmentForm)
