import { Router } from "express"
import {
	renderAssignmentPage,
	renderAssignmentSeasonState,
	submitAssignmentForm,
} from "./assignment.controller"

export const assignmentRoutes = Router()

assignmentRoutes.post("/season-state", renderAssignmentSeasonState)
assignmentRoutes.get("/", renderAssignmentPage)
assignmentRoutes.post("/", submitAssignmentForm)
