import path from "node:path"
import { permitRoutes } from "@permits"
import cors from "cors"
import express, { type Request, type Response } from "express"

import { adminRoutes } from "./modules/admin"

export const app = express()
const srcDir = path.resolve(__dirname)

app.use(cors())
app.use(express.json())
app.set("views", path.join(srcDir, "views"))
app.set("view engine", "ejs")
app.use(express.static(path.join(srcDir, "public")))
app.use("/admin", adminRoutes)
app.use("/permits", permitRoutes)

app.get("/", (_req: Request, res: Response) => {
	res.json({ message: "Vicugna backend is running" })
})
