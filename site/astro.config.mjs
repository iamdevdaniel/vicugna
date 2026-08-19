import { defineConfig } from "astro/config"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
	devToolbar: {
		enabled: false,
	},
	redirects: {
		"/": "/es/",
	},
	vite: {
		plugins: [tailwindcss()],
	},
})
