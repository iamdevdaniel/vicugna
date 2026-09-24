import type { AssignmentPermitCard } from "../../../modules/assignments/assignment.types"

type AssignmentsListPanelProps = {
	selectedCommunityId: string
	selectedPermitId: string
	assignmentSearch: string
	assignmentCards: AssignmentPermitCard[]
	isSubmitting: boolean
	onSearchChange: (value: string) => void
	onSelectPermit: (permitId: string) => void
}

export function AssignmentsListPanel({
	selectedCommunityId,
	selectedPermitId,
	assignmentSearch,
	assignmentCards,
	isSubmitting,
	onSearchChange,
	onSelectPermit,
}: AssignmentsListPanelProps) {
	return (
		<article className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
			<h2 className="text-base font-semibold">Asignaciones actuales</h2>
			<label className="form-control mt-4">
				<span className="label-text mb-2 font-semibold">Buscar</span>
				<input
					className="input input-bordered w-full"
					type="search"
					value={assignmentSearch}
					onChange={(event) => onSearchChange(event.target.value)}
					placeholder="Permiso o encargado"
					disabled={!selectedCommunityId || isSubmitting}
				/>
			</label>

			<div className="mt-4 flex max-h-96 flex-col gap-2 overflow-y-auto">
				{!selectedCommunityId ? (
					<EmptyState>Selecciona una comunidad.</EmptyState>
				) : assignmentCards.length === 0 ? (
					<EmptyState>No se encontraron asignaciones.</EmptyState>
				) : (
					assignmentCards.map((card) => (
						<button
							key={card.permitId}
							type="button"
							className={`rounded-xl border px-3 py-2 text-left ${card.permitId === selectedPermitId ? "border-primary bg-primary/5" : "border-base-300 hover:border-primary/40"}`}
							onClick={() => onSelectPermit(card.permitId)}
							disabled={isSubmitting}
						>
							<div className="flex items-start justify-between gap-3">
								<span className="text-sm font-semibold">
									Permiso {card.permitNumber}
								</span>
								<span className="badge badge-outline badge-sm">
									{card.users.length === 1
										? "1 usuario"
										: `${card.users.length} usuarios`}
								</span>
							</div>
							<div className="mt-2 flex flex-col gap-1">
								{card.users.map((user) => (
									<span
										key={user.assignmentId}
										className={`truncate text-sm ${user.active ? "font-semibold text-success" : "text-base-content/65"}`}
									>
										{user.userFullName}
										{user.active ? " · Principal" : ""}
									</span>
								))}
							</div>
						</button>
					))
				)}
			</div>
		</article>
	)
}

function EmptyState({ children }: { children: string }) {
	return (
		<p className="px-3 py-8 text-center text-sm text-base-content/55">
			{children}
		</p>
	)
}
