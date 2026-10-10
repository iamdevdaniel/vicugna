import PermitOwnershipGate from "@screens/permit/PermitOwnershipGate"
import ShearingScreen from "@screens/shearing/ShearingScreen"

export default function ShearingRoute() {
	return (
		<PermitOwnershipGate>
			<ShearingScreen />
		</PermitOwnershipGate>
	)
}
