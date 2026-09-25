import { useLoaderData } from "react-router"
import { requireAdminSession } from "../admin-auth.server"
import { getAdminAppInfo } from "../admin-info.server"
import { ShellView } from "../screens/shell/shell-view"
import type { Route } from "./+types/protected"

export function loader({ context }: Route.LoaderArgs) {
	return { adminUser: requireAdminSession(context), app: getAdminAppInfo() }
}

export default function ProtectedAdminLayout() {
	const { adminUser, app } = useLoaderData<typeof loader>()
	return <ShellView adminUser={adminUser} app={app} />
}
