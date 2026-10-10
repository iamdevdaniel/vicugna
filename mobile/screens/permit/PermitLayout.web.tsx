import { Slot } from "expo-router"
import PermitRouteGuard from "./PermitRouteGuard"

export default function WebPermitLayout() {
	return (
		<PermitRouteGuard>
			<Slot />
		</PermitRouteGuard>
	)
}
