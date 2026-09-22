import type { RouterContextProvider } from "react-router" with {
	"resolution-mode": "import",
}
import { redirect } from "react-router"
import { adminSessionContext } from "../admin-v2-context.server"

export function requireAdminSession(context: Readonly<RouterContextProvider>) {
	const session = context.get(adminSessionContext)

	if (session.adminUser?.role !== "admin") {
		throw redirect("/login")
	}

	return session.adminUser
}
