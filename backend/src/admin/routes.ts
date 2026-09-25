import {
	index,
	layout,
	type RouteConfig,
	route,
} from "@react-router/dev/routes"

export default [
	route("login", "routes/login.tsx"),
	route("logout", "routes/logout.tsx"),
	route("exports/reports/:permitId", "routes/export-reports.ts"),
	layout("routes/protected.tsx", [
		index("routes/home.tsx"),
		route("mission-control", "routes/mission-control.ts"),
		route("users", "routes/users.tsx"),
		route(
			"users/password-suggestion",
			"routes/user-password-suggestion.ts",
		),
		route("assignments", "routes/assignments.tsx"),
		route("monitoring", "routes/monitoring.tsx"),
	]),
] satisfies RouteConfig
