import type { ReactNode } from "react"

type PermitRouteGuardProps = {
	children: ReactNode
}

export default function WebPermitRouteGuard({
	children,
}: PermitRouteGuardProps) {
	return children
}
