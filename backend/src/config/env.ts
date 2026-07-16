function getRequiredEnv(name: string) {
	const value = process.env[name]?.trim()

	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`)
	}

	return value
}

export const env = {
	port: Number(process.env.PORT ?? 3000),
	databaseUrl: getRequiredEnv("VICUGNA_DATABASE_URL"),
	adminAuthSecret: getRequiredEnv("VICUGNA_ADMIN_AUTH_SECRET"),
	mobileAuthSecret: getRequiredEnv("VICUGNA_MOBILE_AUTH_SECRET"),
	nodeEnv: process.env.NODE_ENV ?? "development",
}
