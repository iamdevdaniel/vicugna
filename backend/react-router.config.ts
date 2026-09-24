import type { Config } from "@react-router/dev/config"

export default {
	appDirectory: "src/admin-v2",
	basename: "/admin-v2/",
	buildDirectory: "build/admin-v2",
	serverModuleFormat: "cjs",
	ssr: true,
} satisfies Config
