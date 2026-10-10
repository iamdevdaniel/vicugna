import PermitOwnershipGate from "@screens/permit/PermitOwnershipGate"
import ShearingHeaderScreen from "@screens/shearing/ShearingHeaderScreen"

export default function ShearingHeaderRoute() {
	return (
		<PermitOwnershipGate>
			<ShearingHeaderScreen />
		</PermitOwnershipGate>
	)
}
