import { defineConfig } from "astro/config"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
	output: "static",
	redirects: {
		"/": "/es/",
	},
	vite: {
		plugins: [tailwindcss()],
	},
})
