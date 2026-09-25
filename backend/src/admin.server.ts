import path from "node:path"
import type { Express, NextFunction, Request, Response } from "express"
import express from "express"
import type { ServerBuild } from "react-router" with {
	"resolution-mode": "import",
}
import { adminSessionContext } from "./admin-context.server"
import { env } from "./config"

const adminPath = /^\/admin(?:\/.*)?$/
const adminLoginPaths = ["/admin/login", "/admin/login.data"]
const adminUsersMutationPaths = ["/admin/users", "/admin/users.data"]
const adminAssignmentsMutationPaths = [
	"/admin/assignments",
	"/admin/assignments.data",
]
const adminMonitoringMutationPaths = [
	"/admin/monitoring",
	"/admin/monitoring.data",
]
const backendRoot = path.resolve(__dirname, "..")
const adminBuildDirectory = path.join(backendRoot, "build", "admin")

export function mountAdminAssets(app: Express) {
	if (env.nodeEnv === "development") return

	app.use(
		"/admin/assets",
		express.static(path.join(adminBuildDirectory, "client", "assets"), {
			immutable: true,
			maxAge: "1y",
		}),
	)
	app.use(
		"/admin",
		express.static(path.join(adminBuildDirectory, "client"), {
			index: false,
			maxAge: "1h",
			redirect: false,
		}),
	)
}

function limitRequestBody(maxBytes: number) {
	return (req: Request, res: Response, next: NextFunction) => {
		const declaredLength = Number(req.get("content-length"))

		if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
			rejectOversizedBody(req, res)
			return
		}

		let receivedBytes = 0
		const cleanup = () => {
			req.off("data", trackBodySize)
			req.off("end", cleanup)
			req.off("close", cleanup)
		}
		const trackBodySize = (chunk: Buffer) => {
			receivedBytes += chunk.byteLength
			if (receivedBytes <= maxBytes) return

			cleanup()
			if (!res.headersSent) {
				rejectOversizedBody(req, res)
			}
		}

		req.on("data", trackBodySize)
		req.once("end", cleanup)
		req.once("close", cleanup)
		next()
	}
}

const limitAdminLoginBody = limitRequestBody(16 * 1024)
const limitAdminUsersBody = limitRequestBody(64 * 1024)

function allowOnlyPostActions(req: Request, res: Response, next: NextFunction) {
	if (!["PUT", "PATCH", "DELETE"].includes(req.method)) {
		next()
		return
	}

	discardRequestBody(req, res)
	res.set("Allow", "GET, HEAD, POST")
	res.status(405).send("Método no permitido")
}

function rejectOversizedBody(req: Request, res: Response) {
	discardRequestBody(req, res)
	res.status(413).send("La solicitud es demasiado grande")
}

function discardRequestBody(req: Request, res: Response) {
	res.once("finish", () => {
		if (!req.complete) req.destroy()
	})
	req.resume()
}

export async function mountAdmin(app: Express) {
	const [{ createRequestHandler }, { RouterContextProvider }] =
		await Promise.all([
			import("@react-router/express"),
			import("react-router"),
		])
	const getLoadContext = (req: Request) => {
		const context = new RouterContextProvider()
		context.set(adminSessionContext, req.session)
		return context
	}
	app.use((req: Request, res: Response, next: NextFunction) => {
		if (req.method === "GET" && req.path === "/admin") {
			res.redirect(308, "/admin/")
			return
		}
		next()
	})

	if (env.nodeEnv === "development") {
		const { createServer } = await import("vite")
		const vite = await createServer({
			appType: "custom",
			root: backendRoot,
			server: { middlewareMode: true },
		})

		app.use((req: Request, res: Response, next: NextFunction) => {
			if (!adminPath.test(req.path)) {
				next()
				return
			}

			const originalUrl = req.url
			vite.middlewares(req, res, (error?: unknown) => {
				req.url = originalUrl
				next(error)
			})
		})
		app.all(adminLoginPaths, allowOnlyPostActions)
		app.all(adminUsersMutationPaths, allowOnlyPostActions)
		app.all(adminAssignmentsMutationPaths, allowOnlyPostActions)
		app.all(adminMonitoringMutationPaths, allowOnlyPostActions)
		app.post(adminLoginPaths, limitAdminLoginBody)
		app.post(adminUsersMutationPaths, limitAdminUsersBody)
		app.post(adminAssignmentsMutationPaths, limitAdminUsersBody)
		app.post(adminMonitoringMutationPaths, limitAdminUsersBody)

		app.all(
			adminPath,
			createRequestHandler({
				build: () =>
					vite.ssrLoadModule(
						"virtual:react-router/server-build",
					) as Promise<ServerBuild>,
				getLoadContext,
			}),
		)
		return
	}

	const build = require(path.join(adminBuildDirectory, "server", "index.js"))

	app.all(adminLoginPaths, allowOnlyPostActions)
	app.all(adminUsersMutationPaths, allowOnlyPostActions)
	app.all(adminAssignmentsMutationPaths, allowOnlyPostActions)
	app.all(adminMonitoringMutationPaths, allowOnlyPostActions)
	app.post(adminLoginPaths, limitAdminLoginBody)
	app.post(adminUsersMutationPaths, limitAdminUsersBody)
	app.post(adminAssignmentsMutationPaths, limitAdminUsersBody)
	app.post(adminMonitoringMutationPaths, limitAdminUsersBody)
	app.all(adminPath, createRequestHandler({ build, getLoadContext }))
}
