import CleaningRecordScreen from "@screens/cleanup/CleaningRecordScreen"
import PermitOwnershipGate from "@screens/permit/PermitOwnershipGate"

export default function CleaningRecordRoute() {
	return (
		<PermitOwnershipGate>
			<CleaningRecordScreen />
		</PermitOwnershipGate>
	)
}
