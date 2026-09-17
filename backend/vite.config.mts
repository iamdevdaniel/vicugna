import { reactRouter } from "@react-router/dev/vite"
import { defineConfig } from "vite"

export default defineConfig({
	base: "/admin-v2/",
	plugins: [reactRouter()],
	resolve: {
		tsconfigPaths: true,
	},
})
