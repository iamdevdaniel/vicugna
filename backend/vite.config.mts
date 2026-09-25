import { reactRouter } from "@react-router/dev/vite"
import { defineConfig } from "vite"

export default defineConfig({
	base: "/admin/",
	plugins: [reactRouter()],
	resolve: {
		dedupe: ["react", "react-dom"],
		tsconfigPaths: true,
	},
	ssr: {
		// The mobile workspace uses a different React version. Bundle UI
		// dependencies that call React hooks so SSR always uses backend React.
		noExternal: [
			/^@floating-ui\//,
			"@mantine/core",
			"@mantine/hooks",
			"react-number-format",
			"react-remove-scroll",
			"react-remove-scroll-bar",
			"react-style-singleton",
			"use-callback-ref",
			"use-sidecar",
			"use-sync-external-store",
			"zustand",
		],
	},
})
