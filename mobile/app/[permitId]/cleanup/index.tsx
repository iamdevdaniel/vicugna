import CleaningScreen from "@screens/cleanup/CleaningScreen"
import PermitOwnershipGate from "@screens/permit/PermitOwnershipGate"

export default function CleaningRoute() {
	return (
		<PermitOwnershipGate>
			<CleaningScreen />
		</PermitOwnershipGate>
	)
}
