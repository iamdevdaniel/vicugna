import { useMemo, useState } from "react"
import { Form, useLoaderData } from "react-router"
import {
	getAssignmentsInitialPageState,
	getAssignmentsPageStateForSeason,
} from "../../modules/assignments/assignment.service"
import type {
	AssignmentPermitCard,
	PermitListItem,
} from "../../modules/assignments/assignment.types"
import { requireAdminSession } from "../admin-auth.server"
import type { Route } from "./+types/assignments"

export function meta() {
	return [{ title: "Asignaciones | Administración Vicugna" }]
}

export async function loader({ request, context }: Route.LoaderArgs) {
	requireAdminSession(context)

	const requestedSeasonId = new URL(request.url).searchParams
		.get("seasonId")
		?.trim()
	const pageState = requestedSeasonId
		? await getAssignmentsPageStateForSeason(requestedSeasonId)
		: await getAssignmentsInitialPageState()

	return pageState
}

export default function AssignmentsPage() {
	const pageState = useLoaderData<typeof loader>()

	return (
		<main className="mx-auto flex w-full max-w-6xl flex-col px-5 py-8 lg:min-h-0">
			<header>
				<p className="text-xs font-bold uppercase tracking-wide text-base-content/55">
					Administración
				</p>
				<h1 className="mt-1 text-3xl font-semibold">Asignaciones</h1>
				<p className="mt-2 text-sm text-base-content/60">
					Consulta los permisos y sus encargados por temporada.
				</p>
			</header>

			<SeasonSummary {...pageState} />
			<AssignmentsWorkspace
				key={pageState.selectedSeasonId}
				permits={pageState.permits}
				communities={pageState.communities}
				assignmentCards={pageState.assignmentCards}
			/>
		</main>
	)
}

type SeasonSummaryProps = Awaited<ReturnType<typeof loader>>

function SeasonSummary({
	seasons,
	selectedSeasonId,
	communitiesWithPermitsCount,
	permitsCount,
}: SeasonSummaryProps) {
	return (
		<section className="mt-6 rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
			<Form
				method="get"
				className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
			>
				<label className="form-control w-full md:max-w-xs">
					<span className="label-text mb-2 font-semibold">
						Temporada
					</span>
					<select
						className="select select-bordered w-full"
						name="seasonId"
						value={selectedSeasonId}
						onChange={(event) =>
							event.currentTarget.form?.requestSubmit()
						}
					>
						{seasons.map((season) => (
							<option key={season.id} value={season.id}>
								{season.name}
							</option>
						))}
					</select>
				</label>

				<div className="flex flex-wrap gap-2">
					<span className="badge badge-lg badge-soft badge-accent">
						{communitiesWithPermitsCount} comunidades
					</span>
					<span className="badge badge-lg badge-soft badge-accent">
						{permitsCount} permisos
					</span>
				</div>
			</Form>
		</section>
	)
}

type AssignmentsWorkspaceProps = {
	permits: PermitListItem[]
	communities: Array<{ id: string; name: string }>
	assignmentCards: AssignmentPermitCard[]
}

function AssignmentsWorkspace({
	permits,
	communities,
	assignmentCards,
}: AssignmentsWorkspaceProps) {
	const [selectedCommunityId, setSelectedCommunityId] = useState("")
	const [selectedPermitId, setSelectedPermitId] = useState("")
	const [permitSearch, setPermitSearch] = useState("")
	const [assignmentSearch, setAssignmentSearch] = useState("")

	const permitCards = useMemo(
		() => new Map(assignmentCards.map((card) => [card.permitId, card])),
		[assignmentCards],
	)
	const visiblePermits = permits.filter((permit) => {
		if (permit.communityId !== selectedCommunityId) return false
		return includesSearch(permit.permitNumber, permitSearch)
	})
	const visibleAssignmentCards = assignmentCards.filter((card) => {
		if (card.communityId !== selectedCommunityId) return false
		return includesSearch(
			[
				card.permitNumber,
				...card.users.map((user) => user.userFullName),
			].join(" "),
			assignmentSearch,
		)
	})
	const selectedPermit = permits.find(
		(permit) => permit.id === selectedPermitId,
	)
	const selectedAssignment = selectedPermit
		? permitCards.get(selectedPermit.id)
		: undefined

	function selectCommunity(communityId: string) {
		setSelectedCommunityId(communityId)
		setSelectedPermitId("")
		setPermitSearch("")
		setAssignmentSearch("")
	}

	function selectPermit(permitId: string) {
		setSelectedPermitId((currentId) =>
			currentId === permitId ? "" : permitId,
		)
	}

	return (
		<section className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
			<article className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
				<h2 className="text-base font-semibold">Permisos</h2>
				<label className="form-control mt-4">
					<span className="label-text mb-2 font-semibold">
						Comunidad
					</span>
					<select
						className="select select-bordered w-full"
						value={selectedCommunityId}
						onChange={(event) =>
							selectCommunity(event.target.value)
						}
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

				<label className="form-control mt-3">
					<span className="label-text mb-2 font-semibold">
						Buscar permiso
					</span>
					<input
						className="input input-bordered w-full"
						type="search"
						value={permitSearch}
						onChange={(event) =>
							setPermitSearch(event.target.value)
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
						<PermitButton
							key={permit.id}
							permit={permit}
							assignedUsersCount={
								permitCards.get(permit.id)?.users.length ?? 0
							}
							selected={permit.id === selectedPermitId}
							onSelect={selectPermit}
						/>
					))}
				</div>
			</article>

			<article className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
				<h2 className="text-base font-semibold">
					Permiso seleccionado
				</h2>
				{selectedPermit ? (
					<div className="mt-4">
						<p className="text-xl font-semibold">
							{selectedPermit.permitNumber}
						</p>
						<p className="mt-1 text-sm text-base-content/60">
							{selectedPermit.communityName}
						</p>
						<h3 className="mt-5 text-sm font-semibold">
							Encargados
						</h3>
						<div className="mt-2 flex flex-col gap-2">
							{selectedAssignment?.users.length ? (
								selectedAssignment.users.map((user) => (
									<div
										key={user.assignmentId}
										className="flex items-center justify-between gap-3 rounded-xl border border-base-300 px-3 py-2"
									>
										<span className="min-w-0 truncate text-sm">
											{user.userFullName}
										</span>
										{user.active ? (
											<span className="badge badge-success badge-soft badge-sm">
												Principal
											</span>
										) : null}
									</div>
								))
							) : (
								<p className="py-6 text-center text-sm text-base-content/55">
									Aún no hay encargados asignados.
								</p>
							)}
						</div>
					</div>
				) : (
					<p className="py-12 text-center text-sm text-base-content/55">
						Selecciona un permiso para ver sus encargados.
					</p>
				)}
			</article>

			<article className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
				<h2 className="text-base font-semibold">
					Asignaciones actuales
				</h2>
				<label className="form-control mt-4">
					<span className="label-text mb-2 font-semibold">
						Buscar
					</span>
					<input
						className="input input-bordered w-full"
						type="search"
						value={assignmentSearch}
						onChange={(event) =>
							setAssignmentSearch(event.target.value)
						}
						placeholder="Permiso o encargado"
						disabled={!selectedCommunityId}
					/>
				</label>

				<div className="mt-4 flex max-h-96 flex-col gap-2 overflow-y-auto">
					{!selectedCommunityId ? (
						<EmptyState>Selecciona una comunidad.</EmptyState>
					) : visibleAssignmentCards.length === 0 ? (
						<EmptyState>No se encontraron asignaciones.</EmptyState>
					) : (
						visibleAssignmentCards.map((card) => (
							<AssignmentCard
								key={card.permitId}
								card={card}
								selected={card.permitId === selectedPermitId}
								onSelect={selectPermit}
							/>
						))
					)}
				</div>
			</article>
		</section>
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
	if (!hasSeasonPermits) {
		return <EmptyState>Aún no hay permisos para esta temporada.</EmptyState>
	}
	if (!hasCommunity) {
		return <EmptyState>Selecciona una comunidad.</EmptyState>
	}
	if (!hasVisiblePermits) {
		return <EmptyState>No se encontraron permisos.</EmptyState>
	}
	return null
}

function PermitButton({
	permit,
	assignedUsersCount,
	selected,
	onSelect,
}: {
	permit: PermitListItem
	assignedUsersCount: number
	selected: boolean
	onSelect: (permitId: string) => void
}) {
	return (
		<button
			type="button"
			className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left ${selected ? "border-primary bg-primary/5" : "border-base-300 hover:border-primary/40"}`}
			onClick={() => onSelect(permit.id)}
		>
			<span className="truncate text-sm font-semibold">
				{permit.permitNumber}
			</span>
			<span className="badge badge-ghost badge-sm">
				{assignedUsersCount}
			</span>
		</button>
	)
}

function AssignmentCard({
	card,
	selected,
	onSelect,
}: {
	card: AssignmentPermitCard
	selected: boolean
	onSelect: (permitId: string) => void
}) {
	return (
		<button
			type="button"
			className={`rounded-xl border px-3 py-2 text-left ${selected ? "border-primary bg-primary/5" : "border-base-300 hover:border-primary/40"}`}
			onClick={() => onSelect(card.permitId)}
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
	)
}

function EmptyState({ children }: { children: string }) {
	return (
		<p className="px-3 py-8 text-center text-sm text-base-content/55">
			{children}
		</p>
	)
}

function includesSearch(value: string, search: string) {
	return value
		.toLocaleLowerCase("es")
		.includes(search.trim().toLocaleLowerCase("es"))
}

function countCommunityPermits(permits: PermitListItem[], communityId: string) {
	return permits.filter((permit) => permit.communityId === communityId).length
}
