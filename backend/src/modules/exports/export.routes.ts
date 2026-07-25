import { Router } from "express"
import { downloadParticipantsRegister } from "./export.controller"

export const exportRoutes = Router()

exportRoutes.get("/participants/:permitId", downloadParticipantsRegister)
