import { Router } from "express"
import {
	renderAssignmentPage,
	submitAssignmentForm,
	submitPermitForm,
} from "./assignment.controller"

export const assignmentRoutes = Router()

assignmentRoutes.get("/", renderAssignmentPage)
assignmentRoutes.post("/permits", submitPermitForm)
assignmentRoutes.post("/", submitAssignmentForm)
