import cors from "cors"
import express, { type Request, type Response } from "express"

export const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (_req: Request, res: Response) => {
	res.json({ message: "Vicugna backend is running" })
})
