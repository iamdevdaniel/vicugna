import path from "node:path"
import type { Express, NextFunction, Request, Response } from "express"
import express from "express"
import type { ServerBuild } from "react-router" with {
	"resolution-mode": "import",
}
import { adminSessionContext } from "./admin-v2-context.server"
import { env } from "./config"

const adminV2Path = /^\/admin-v2(?:\/.*)?$/
const adminLoginPaths = ["/admin-v2/login", "/admin-v2/login.data"]
const adminLoginBodyLimit = 16 * 1024
const backendRoot = path.resolve(__dirname, "..")
const adminBuildDirectory = path.join(backendRoot, "build", "admin-v2")

function limitAdminLoginBody(req: Request, res: Response, next: NextFunction) {
	const declaredLength = Number(req.get("content-length"))

	if (
		Number.isFinite(declaredLength) &&
		declaredLength > adminLoginBodyLimit
	) {
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
		if (receivedBytes <= adminLoginBodyLimit) return

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

function rejectOversizedBody(req: Request, res: Response) {
	res.once("finish", () => {
		if (!req.complete) req.destroy()
	})
	req.resume()
	res.status(413).send("La solicitud es demasiado grande")
}

export async function mountAdminV2(app: Express) {
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

	if (env.nodeEnv === "development") {
		const { createServer } = await import("vite")
		const vite = await createServer({
			appType: "custom",
			root: backendRoot,
			server: { middlewareMode: true },
		})

		app.use((req: Request, res: Response, next: NextFunction) => {
			if (!adminV2Path.test(req.path)) {
				next()
				return
			}

			const originalUrl = req.url
			vite.middlewares(req, res, (error?: unknown) => {
				req.url = originalUrl
				next(error)
			})
		})
		app.post(adminLoginPaths, limitAdminLoginBody)

		app.all(
			adminV2Path,
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

	app.use(
		"/admin-v2/assets",
		express.static(path.join(adminBuildDirectory, "client", "assets"), {
			immutable: true,
			maxAge: "1y",
		}),
	)
	app.use(
		"/admin-v2",
		express.static(path.join(adminBuildDirectory, "client"), {
			index: false,
			maxAge: "1h",
			redirect: false,
		}),
	)

	const build = require(path.join(adminBuildDirectory, "server", "index.js"))

	app.post(adminLoginPaths, limitAdminLoginBody)
	app.all(adminV2Path, createRequestHandler({ build, getLoadContext }))
}
