import path from "node:path"
import type { Express, NextFunction, Request, Response } from "express"
import express from "express"
import type { ServerBuild } from "react-router" with {
	"resolution-mode": "import",
}
import { env } from "./config"

const adminV2Path = /^\/admin-v2(?:\/.*)?$/
const backendRoot = path.resolve(__dirname, "..")
const adminBuildDirectory = path.join(backendRoot, "build", "admin-v2")

export async function mountAdminV2(app: Express) {
	const { createRequestHandler } = await import("@react-router/express")

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

			vite.middlewares(req, res, next)
		})

		app.all(
			adminV2Path,
			createRequestHandler({
				build: () =>
					vite.ssrLoadModule(
						"virtual:react-router/server-build",
					) as Promise<ServerBuild>,
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
		}),
	)

	const build = require(path.join(adminBuildDirectory, "server", "index.js"))

	app.all(adminV2Path, createRequestHandler({ build }))
}
