export const env = {
	port: Number(process.env.PORT ?? 3000),
	databaseUrl: process.env.DATABASE_URL,
	sessionSecret: process.env.SESSION_SECRET ?? "vicugna-dev-session-secret",
	nodeEnv: process.env.NODE_ENV ?? "development",
}
