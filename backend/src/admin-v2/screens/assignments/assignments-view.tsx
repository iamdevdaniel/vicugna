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
		<main className="mx-auto flex w-full max-w-6xl flex-col px-5 py-8 lg:min-h-0">
			<header>
				<p className="text-xs font-bold uppercase tracking-wide text-base-content/55">
					Administración
				</p>
				<h1 className="mt-1 text-3xl font-semibold">Asignaciones</h1>
				<p className="mt-2 text-sm text-base-content/60">
					Gestiona los permisos y sus encargados por temporada.
				</p>
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
		</main>
	)
}
