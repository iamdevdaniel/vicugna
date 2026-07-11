import path from "node:path"
import { env, isDatabaseConnectionError, pool } from "@config"
import { permitRoutes } from "@permits"
import connectPgSimple from "connect-pg-simple"
import cors from "cors"
import express, {
	type NextFunction,
	type Request,
	type Response,
} from "express"
import session from "express-session"

import { adminRoutes } from "./modules/admin/admin.routes"

export const app = express()
const srcDir = path.resolve(__dirname)
const PgSessionStore = connectPgSimple(session)

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(
	session({
		store: new PgSessionStore({
			pool,
			createTableIfMissing: true,
		}),
		secret: env.sessionSecret,
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			sameSite: "lax",
			secure: env.nodeEnv === "production",
			maxAge: 1000 * 60 * 60 * 12,
		},
	}),
)
app.set("views", path.join(srcDir, "views"))
app.set("view engine", "ejs")
app.use(express.static(path.join(srcDir, "public")))
app.use("/admin", adminRoutes)
app.use("/permits", permitRoutes)

app.get("/", (_req: Request, res: Response) => {
	res.json({ message: "Vicugna backend is running" })
})

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
	if (res.headersSent) {
		next(error)
		return
	}

	if (!isDatabaseConnectionError(error)) {
		next(error)
		return
	}

	if (req.accepts("html")) {
		res.status(503).send(
			"Base de datos no disponible. Intenta de nuevo en un momento.",
		)
		return
	}

	res.status(503).json({
		message: "Base de datos no disponible. Intenta de nuevo en un momento.",
	})
})
