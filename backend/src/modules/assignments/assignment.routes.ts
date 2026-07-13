import { Router } from "express"
import {
	renderAssignmentPage,
	submitAssignmentForm,
	submitPermitForm,
	submitPermitRenameForm,
} from "./assignment.controller"

export const assignmentRoutes = Router()

assignmentRoutes.get("/", renderAssignmentPage)
assignmentRoutes.post("/permits", submitPermitForm)
assignmentRoutes.post("/permits/rename", submitPermitRenameForm)
assignmentRoutes.post("/", submitAssignmentForm)
