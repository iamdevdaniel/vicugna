import { LoadingOverlay } from "@components"
import { useReadSinglePermit } from "@hooks"
import { useMobileAuthStore } from "@utils/auth-store"
import { ROUTES } from "@utils/constants"
import { useDataOperationGuard } from "@utils/data-operation-guard"
import { Redirect, useLocalSearchParams, usePathname } from "expo-router"
import { type ReactNode, useEffect } from "react"
import { BackHandler } from "react-native"

type PermitRouteGuardProps = {
	children: ReactNode
}

export default function NativePermitRouteGuard({
	children,
}: PermitRouteGuardProps) {
	const { permitId } = useLocalSearchParams<{ permitId: string }>()
	const pathname = usePathname()
	const userId = useMobileAuthStore((state) => state.localDataUserId)
	const navigationMode = useDataOperationGuard(
		(state) => state.navigationMode,
	)
	const { data: permit, loading } = useReadSinglePermit(permitId)
	const isPermitOverview = pathname === `/${permitId}`

	useEffect(() => {
		if (isPermitOverview) return

		const shouldBlockNavigation = () =>
			useDataOperationGuard.getState().navigationMode === "current-screen"
		const backHandlerSubscription = BackHandler.addEventListener(
			"hardwareBackPress",
			shouldBlockNavigation,
		)

		return () => {
			backHandlerSubscription.remove()
		}
	}, [isPermitOverview])

	if (loading) return <LoadingOverlay message="Cargando..." />
	if (!userId || permit?.userId !== userId) {
		return <Redirect href={ROUTES.HOME} />
	}
	if (
		(permit.syncPending || navigationMode === "overview-only") &&
		!isPermitOverview
	) {
		return (
			<Redirect
				href={ROUTES.OVERVIEW({
					permitId,
					permitNumber: permit.permitNumber,
				})}
			/>
		)
	}

	return children
}
