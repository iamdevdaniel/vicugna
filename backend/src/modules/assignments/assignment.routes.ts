import { Router } from "express"
import {
	activateAssignment,
	deleteAssignment,
	renderAssignmentPage,
	renderAssignmentSeasonState,
	submitAssignmentForm,
	submitPermitForm,
} from "./assignment.controller"

export const assignmentRoutes = Router()

assignmentRoutes.get("/season-state", renderAssignmentSeasonState)
assignmentRoutes.get("/", renderAssignmentPage)
assignmentRoutes.post("/permits", submitPermitForm)
assignmentRoutes.post("/activate", activateAssignment)
assignmentRoutes.post("/delete", deleteAssignment)
assignmentRoutes.post("/", submitAssignmentForm)
