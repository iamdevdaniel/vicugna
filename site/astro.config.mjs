import { defineConfig } from "astro/config"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
	site: "https://vicugna-site.maydanachi.workers.dev",
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
