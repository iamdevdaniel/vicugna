import { useRef } from "react"
import { useForm } from "react-hook-form"
import type { FetcherWithComponents } from "react-router"
import type {
	PermitListItem,
	SelectOption,
} from "../../../modules/assignments/assignment.types"
import type { AssignmentActionData } from "./assignments-types"

type PermitsPanelProps = {
	fetcher: FetcherWithComponents<AssignmentActionData>
	selectedSeasonId: string
	communities: SelectOption[]
	permits: PermitListItem[]
	selectedCommunityId: string
	selectedPermitId: string
	permitSearch: string
	newPermitNumber: string
	visiblePermits: PermitListItem[]
	hasConflictingChanges: boolean
	isSubmitting: boolean
	onMutationStart: () => boolean
	assignedUsersCount: (permitId: string) => number
	onSelectCommunity: (communityId: string) => void
	onSelectPermit: (permitId: string) => void
	onPermitSearchChange: (value: string) => void
	onNewPermitNumberChange: (value: string) => void
}

export function PermitsPanel({
	fetcher,
	selectedSeasonId,
	communities,
	permits,
	selectedCommunityId,
	selectedPermitId,
	permitSearch,
	newPermitNumber,
	visiblePermits,
	hasConflictingChanges,
	isSubmitting,
	onMutationStart,
	assignedUsersCount,
	onSelectCommunity,
	onSelectPermit,
	onPermitSearchChange,
	onNewPermitNumberChange,
}: PermitsPanelProps) {
	const formRef = useRef<HTMLFormElement>(null)
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<{ permitNumber: string }>({
		mode: "onChange",
		values: { permitNumber: newPermitNumber },
	})
	const permitNumberField = register("permitNumber", {
		required: "El número de permiso es obligatorio",
		onChange: (event) => onNewPermitNumberChange(event.target.value),
	})
	const submitPermit = handleSubmit(() => {
		if (!formRef.current || !onMutationStart()) return
		fetcher.submit(formRef.current)
	})

	return (
		<article className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
			<h2 className="text-base font-semibold">Crear permiso</h2>
			<label className="form-control mt-4">
				<span className="label-text mb-2 font-semibold">Comunidad</span>
				<select
					className="select select-bordered w-full"
					value={selectedCommunityId}
					onChange={(event) => onSelectCommunity(event.target.value)}
					disabled={isSubmitting}
				>
					<option value="">Selecciona una comunidad</option>
					{communities.map((community) => (
						<option key={community.id} value={community.id}>
							{community.name} (
							{countCommunityPermits(permits, community.id)})
						</option>
					))}
				</select>
			</label>

			<fetcher.Form
				ref={formRef}
				method="post"
				className="mt-3"
				onSubmit={submitPermit}
				noValidate
			>
				<input type="hidden" name="intent" value="create-permit" />
				<input type="hidden" name="seasonId" value={selectedSeasonId} />
				<input
					type="hidden"
					name="communityId"
					value={selectedCommunityId}
				/>
				<label className="form-control">
					<span className="label-text mb-2 font-semibold">
						Nuevo permiso
					</span>
					<div className="join w-full">
						<input
							className="input input-bordered join-item min-w-0 flex-1"
							{...permitNumberField}
							value={newPermitNumber}
							placeholder="Número de permiso"
							disabled={!selectedCommunityId || isSubmitting}
							aria-invalid={Boolean(errors.permitNumber)}
						/>
						<button
							type="submit"
							className="btn btn-primary join-item"
							disabled={
								!selectedCommunityId ||
								!newPermitNumber.trim() ||
								hasConflictingChanges ||
								isSubmitting
							}
						>
							{isSubmitting ? "Guardando..." : "Crear"}
						</button>
					</div>
				</label>
				{errors.permitNumber ? (
					<p className="mt-1 text-error text-sm" role="alert">
						{errors.permitNumber.message}
					</p>
				) : null}
			</fetcher.Form>

			<label className="form-control mt-3">
				<span className="label-text mb-2 font-semibold">
					Buscar permiso
				</span>
				<input
					className="input input-bordered w-full"
					type="search"
					value={permitSearch}
					onChange={(event) =>
						onPermitSearchChange(event.target.value)
					}
					placeholder="Número de permiso"
					disabled={!selectedCommunityId}
				/>
			</label>

			<div className="mt-4 flex max-h-96 flex-col gap-2 overflow-y-auto">
				<PermitListState
					hasSeasonPermits={permits.length > 0}
					hasCommunity={Boolean(selectedCommunityId)}
					hasVisiblePermits={visiblePermits.length > 0}
				/>
				{visiblePermits.map((permit) => (
					<button
						key={permit.id}
						type="button"
						className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left ${permit.id === selectedPermitId ? "border-primary bg-primary/5" : "border-base-300 hover:border-primary/40"}`}
						onClick={() => onSelectPermit(permit.id)}
						disabled={isSubmitting}
					>
						<span className="truncate text-sm font-semibold">
							{permit.permitNumber}
						</span>
						<span className="badge badge-ghost badge-sm">
							{assignedUsersCount(permit.id)}
						</span>
					</button>
				))}
			</div>
		</article>
	)
}

function PermitListState({
	hasSeasonPermits,
	hasCommunity,
	hasVisiblePermits,
}: {
	hasSeasonPermits: boolean
	hasCommunity: boolean
	hasVisiblePermits: boolean
}) {
	if (!hasSeasonPermits)
		return <EmptyState>Aún no hay permisos para esta temporada.</EmptyState>
	if (!hasCommunity) return <EmptyState>Selecciona una comunidad.</EmptyState>
	if (!hasVisiblePermits)
		return <EmptyState>No se encontraron permisos.</EmptyState>
	return null
}

function EmptyState({ children }: { children: string }) {
	return (
		<p className="px-3 py-8 text-center text-sm text-base-content/55">
			{children}
		</p>
	)
}

function countCommunityPermits(permits: PermitListItem[], communityId: string) {
	return permits.filter((permit) => permit.communityId === communityId).length
}
