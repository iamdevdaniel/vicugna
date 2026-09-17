import "dotenv/config"
import { createApp } from "./app"

const port = Number(process.env.PORT ?? 3000)

async function startServer() {
	const app = await createApp()

	app.listen(port, () => {
		console.log(`Server running on http://localhost:${port}`)
	})
}

startServer().catch((error: unknown) => {
	console.error("Unable to start server", error)
	process.exitCode = 1
})
