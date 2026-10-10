import ParticipantScreen from "@screens/participants/ParticipantScreen"
import PermitOwnershipGate from "@screens/permit/PermitOwnershipGate"

export default function ParticipantRoute() {
	return (
		<PermitOwnershipGate>
			<ParticipantScreen />
		</PermitOwnershipGate>
	)
}
