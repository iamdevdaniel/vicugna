import { Router } from "express"
import { renderAssignmentPage } from "./assignment.controller"

export const assignmentRoutes = Router()

assignmentRoutes.get("/", renderAssignmentPage)
