import { data } from "react-router"
import { getSuggestedTemporaryPassword } from "../../modules/users/user.service"
import { requireAdminSession } from "../admin-auth.server"
import type { Route } from "./+types/user-password-suggestion"

export function headers() {
	return { "Cache-Control": "no-store" }
}

export function loader({ context }: Route.LoaderArgs) {
	requireAdminSession(context)

	return data(
		{ password: getSuggestedTemporaryPassword() },
		{ headers: { "Cache-Control": "no-store" } },
	)
}
