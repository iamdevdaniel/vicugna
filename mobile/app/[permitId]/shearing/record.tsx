import PermitOwnershipGate from "@screens/permit/PermitOwnershipGate"
import ShearingRecordScreen from "@screens/shearing/ShearingRecordScreen"

export default function ShearingRecordRoute() {
	return (
		<PermitOwnershipGate>
			<ShearingRecordScreen />
		</PermitOwnershipGate>
	)
}
