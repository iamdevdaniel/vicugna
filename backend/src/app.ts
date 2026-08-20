import path from "node:path"
import { env, isDatabaseConnectionError, pool } from "@config"
import connectPgSimple from "connect-pg-simple"
import cors from "cors"
import express, {
	type NextFunction,
	type Request,
	type Response,
} from "express"
import { rateLimit } from "express-rate-limit"
import session from "express-session"
import backendPackage from "../package.json"

import { adminRoutes } from "./modules/admin/admin.routes"
import { mobileInRoutes } from "./modules/mobile_in"
import { mobileOutRoutes } from "./modules/mobile_out"
import { mobileAuthRoutes } from "./modules/mobile-auth/mobile_auth.routes"

export const app = express()
const srcDir = path.resolve(__dirname, "..", "src")
const PgSessionStore = connectPgSimple(session)
const rateLimitMessage =
	"Demasiadas solicitudes. Intenta de nuevo en un momento."

function sendRateLimitResponse(req: Request, res: Response) {
	if (req.accepts(["json", "html"]) === "html") {
		res.status(429).send(rateLimitMessage)
		return
	}

	res.status(429).json({ message: rateLimitMessage })
}

const globalRateLimiter = rateLimit({
	windowMs: 60 * 1000,
	limit: 300,
	standardHeaders: "draft-8",
	legacyHeaders: false,
	handler: sendRateLimitResponse,
})

const loginRateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 5,
	standardHeaders: "draft-8",
	legacyHeaders: false,
	skipSuccessfulRequests: true,
	handler: sendRateLimitResponse,
})

app.locals.faviconPath =
	env.nodeEnv === "development" ? "/favicon-dev.png" : "/favicon.png"
app.locals.appVersion = backendPackage.version
app.set("trust proxy", 1)
app.use(globalRateLimiter)
app.post(["/admin/login", "/mobile/auth/login"], loginRateLimiter)
app.use(cors())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: false, limit: "10mb" }))
app.use(
	session({
		store: new PgSessionStore({
			pool,
		}),
		secret: env.adminAuthSecret,
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
app.use("/mobile/auth", mobileAuthRoutes)
app.use("/mobile", mobileOutRoutes)
app.use("/permits", mobileInRoutes)

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
