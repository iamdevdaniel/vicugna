import ParticipantsScreen from "@screens/participants/ParticipantsScreen"
import PermitOwnershipGate from "@screens/permit/PermitOwnershipGate"

export default function ParticipantsRoute() {
	return (
		<PermitOwnershipGate>
			<ParticipantsScreen />
		</PermitOwnershipGate>
	)
}
