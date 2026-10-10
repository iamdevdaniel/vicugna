import { LoadingOverlay } from "@components"
import { useReadSinglePermit } from "@hooks"
import { useMobileAuthStore } from "@utils/auth-store"
import { ROUTES } from "@utils/constants"
import { Redirect, useLocalSearchParams } from "expo-router"
import type { ReactNode } from "react"

type PermitOwnershipGateProps = {
	children: ReactNode
}

export default function NativePermitOwnershipGate({
	children,
}: PermitOwnershipGateProps) {
	const { permitId } = useLocalSearchParams<{ permitId: string }>()
	const accountId = useMobileAuthStore((state) => state.localDataUserId)
	const { data: permit, loading } = useReadSinglePermit(permitId)

	if (loading) return <LoadingOverlay message="Cargando..." />
	if (!accountId || permit?.userId !== accountId) {
		return <Redirect href={ROUTES.HOME} />
	}

	return children
}
