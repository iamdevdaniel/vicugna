import { Box, Container, Paper, Text, Title } from "@mantine/core"
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
		<Container
			component="main"
			size="lg"
			py="md"
			className="admin-page-fixed"
		>
			<Box
				component="header"
				mih={72}
				py={6}
				display="flex"
				style={{ flexDirection: "column", justifyContent: "center" }}
			>
				<Title order={1} size="h2">
					Asignaciones
				</Title>
				<Text mt="xs" size="sm" c="dimmed">
					Gestiona los permisos y su encargado por temporada.
				</Text>
			</Box>

			<Paper
				component="section"
				mt="md"
				p="md"
				style={{ minHeight: 0, flex: 1, overflow: "auto" }}
			>
				<AssignmentsSeasonSummary
					seasons={props.seasons}
					selectedSeasonId={props.selectedSeasonId}
					communitiesWithPermitsCount={
						props.communitiesWithPermitsCount
					}
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
			</Paper>
		</Container>
	)
}
