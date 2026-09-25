import type { Config } from "@react-router/dev/config"

export default {
	appDirectory: "src/admin",
	basename: "/admin/",
	buildDirectory: "build/admin",
	serverModuleFormat: "cjs",
	ssr: true,
} satisfies Config
