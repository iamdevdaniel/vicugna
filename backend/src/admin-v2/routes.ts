import {
	index,
	layout,
	type RouteConfig,
	route,
} from "@react-router/dev/routes"

export default [
	route("login", "routes/login.tsx"),
	route("logout", "routes/logout.tsx"),
	layout("routes/protected.tsx", [
		index("routes/home.tsx"),
		route("users", "routes/users.tsx"),
		route(
			"users/password-suggestion",
			"routes/user-password-suggestion.ts",
		),
	]),
] satisfies RouteConfig
