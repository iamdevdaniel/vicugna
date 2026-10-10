import { LoadingOverlay } from "@components"
import { useReadSinglePermit } from "@hooks"
import { useMobileAuthStore } from "@utils/auth-store"
import { ROUTES } from "@utils/constants"
import { Redirect, useLocalSearchParams } from "expo-router"
import type { ReactNode } from "react"

type PermitRouteGuardProps = {
	children: ReactNode
}

export default function NativePermitRouteGuard({
	children,
}: PermitRouteGuardProps) {
	const { permitId } = useLocalSearchParams<{ permitId: string }>()
	const userId = useMobileAuthStore((state) => state.localDataUserId)
	const { data: permit, loading } = useReadSinglePermit(permitId)

	if (loading) return <LoadingOverlay message="Cargando..." />
	if (!userId || permit?.userId !== userId) {
		return <Redirect href={ROUTES.HOME} />
	}

	return children
}
