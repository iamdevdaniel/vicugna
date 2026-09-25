import { Container, Text, Title } from "@mantine/core"
import type {
	AssignmentPermitCard,
	ManagedUserOption,
	PermitListItem,
	SelectOption,
} from "../../../modules/assignments/assignment.types"
import { AssignmentsSeasonSummary } from "./assignments-season-summary"
import { AssignmentsWorkspace } from "./assignments-workspace"

type AssignmentsViewProps = {
	seasons: SelectOption[]
	selectedSeasonId: string
	communitiesWithPermitsCount: number
	permitsCount: number
	permits: PermitListItem[]
	communities: SelectOption[]
	users: ManagedUserOption[]
	assignmentCards: AssignmentPermitCard[]
}

export function AssignmentsView(props: AssignmentsViewProps) {
	return (
		<Container component="main" size="lg" py="xl">
			<header>
				<Text size="xs" fw={700} c="dimmed" tt="uppercase">
					Administración
				</Text>
				<Title order={1} mt={4}>
					Asignaciones
				</Title>
				<Text mt="xs" size="sm" c="dimmed">
					Gestiona los permisos y sus encargados por temporada.
				</Text>
			</header>

			<AssignmentsSeasonSummary
				seasons={props.seasons}
				selectedSeasonId={props.selectedSeasonId}
				communitiesWithPermitsCount={props.communitiesWithPermitsCount}
				permitsCount={props.permitsCount}
			/>
			<AssignmentsWorkspace
				key={props.selectedSeasonId}
				permits={props.permits}
				communities={props.communities}
				users={props.users}
				assignmentCards={props.assignmentCards}
				selectedSeasonId={props.selectedSeasonId}
			/>
		</Container>
	)
}
