import CleaningHeaderScreen from "@screens/cleanup/CleaningHeaderScreen"
import PermitOwnershipGate from "@screens/permit/PermitOwnershipGate"

export default function CleaningHeaderRoute() {
	return (
		<PermitOwnershipGate>
			<CleaningHeaderScreen />
		</PermitOwnershipGate>
	)
}
