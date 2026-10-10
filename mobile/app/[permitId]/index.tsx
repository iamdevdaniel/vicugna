import PermitOwnershipGate from "@screens/permit/PermitOwnershipGate"
import PermitScreen from "@screens/permit/PermitScreen"

export default function PermitRoute() {
	return (
		<PermitOwnershipGate>
			<PermitScreen />
		</PermitOwnershipGate>
	)
}
