import { Router } from "express"
import {
	renderAssignmentPage,
	submitAssignmentForm,
} from "./assignment.controller"

export const assignmentRoutes = Router()

assignmentRoutes.get("/", renderAssignmentPage)
assignmentRoutes.post("/", submitAssignmentForm)
