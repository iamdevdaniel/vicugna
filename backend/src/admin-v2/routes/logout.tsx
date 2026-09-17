import { redirect } from "react-router"
import { adminSessionContext } from "../../admin-v2-context.server"
import type { Route } from "./+types/logout"

export async function action({ context }: Route.ActionArgs) {
	const session = context.get(adminSessionContext)

	await new Promise<void>((resolve, reject) => {
		session.destroy((error?: unknown) => {
			if (error) {
				reject(error)
				return
			}

			resolve()
		})
	})

	return redirect("/login")
}

export function loader() {
	return redirect("/")
}
