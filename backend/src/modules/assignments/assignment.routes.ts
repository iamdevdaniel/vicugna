import { Router } from "express"
import {
	renderAssignmentPage,
	renderAvailableAssignmentUsers,
	submitAssignmentForm,
} from "./assignment.controller"

export const assignmentRoutes = Router()

assignmentRoutes.post("/available-users", renderAvailableAssignmentUsers)
assignmentRoutes.get("/", renderAssignmentPage)
assignmentRoutes.post("/", submitAssignmentForm)
