import { Link } from "react-router"
import { SYNCED_PERMIT_STATUSES } from "../../../modules/common/common.constants"
import type {
	MonitoringCommunityGroup,
	MonitoringPermitGroup,
} from "../../../modules/monitoring/monitoring.types"
import { useMonitoringState } from "./monitoring-state"

type MonitoringOverviewProps = {
	seasonId: string
	communityGroups: MonitoringCommunityGroup[]
}

export function MonitoringOverview({
	seasonId,
	communityGroups,
}: MonitoringOverviewProps) {
	const state = useMonitoringState(seasonId, communityGroups)

	return (
		<section className="flex flex-col rounded-box border border-base-300 bg-base-100 p-4 shadow-sm lg:h-full lg:min-h-0">
			<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
				<div className="flex w-full items-end gap-2 md:max-w-xl">
					<label className="form-control w-full">
						<span className="label-text mb-2 font-semibold">
							Buscar
						</span>
						<input
							className="input input-bordered input-sm w-full"
							type="search"
							value={state.search}
							onChange={(event) =>
								state.setSearch(event.target.value)
							}
							placeholder="Comunidad, permiso o encargado"
						/>
					</label>
					<button
						type="button"
						className={`btn btn-sm shrink-0 ${state.showSyncedOnly ? "btn-success" : "btn-outline"}`}
						onClick={state.toggleSyncedOnly}
						aria-pressed={state.showSyncedOnly}
					>
						Sincronizados
					</button>
				</div>
				<button
					type="button"
					className="btn btn-outline btn-sm"
					onClick={state.toggleAllCommunities}
				>
					{state.areAllCommunitiesExpanded
						? "Colapsar todo"
						: "Expandir todo"}
				</button>
			</div>

			<div
				ref={state.scrollContainerRef}
				onScroll={state.handleScroll}
				className="mt-4 flex flex-col gap-3 overflow-y-auto pr-1 lg:h-0 lg:min-h-0 lg:flex-1 lg:basis-0"
			>
				{state.filteredCommunityGroups.length === 0 ? (
					<p className="px-3 py-12 text-center text-sm text-base-content/55">
						No se encontraron permisos.
					</p>
				) : null}
				{state.filteredCommunityGroups.map((community) => (
					<CommunitySection
						key={community.communityId}
						community={community}
						seasonId={seasonId}
						expanded={state.isExpanded(community.communityId)}
						onToggle={() =>
							state.toggleCommunity(community.communityId)
						}
						onOpenPermit={state.saveState}
					/>
				))}
			</div>
		</section>
	)
}

function CommunitySection({
	community,
	seasonId,
	expanded,
	onToggle,
	onOpenPermit,
}: {
	community: MonitoringCommunityGroup
	seasonId: string
	expanded: boolean
	onToggle: () => void
	onOpenPermit: () => void
}) {
	return (
		<section className="rounded-xl border border-base-300 bg-base-100">
			<button
				type="button"
				className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition hover:bg-base-200/50"
				onClick={onToggle}
				aria-expanded={expanded}
			>
				<h2 className="truncate text-sm font-semibold">
					{community.communityName}
				</h2>
				<span className="text-xs text-base-content/55">
					{community.permits.length} permisos {expanded ? "▾" : "›"}
				</span>
			</button>
			{expanded ? (
				<div className="grid grid-cols-1 gap-2 border-base-200 border-t px-3 py-3 md:grid-cols-2 xl:grid-cols-4">
					{community.permits.map((permit) => (
						<PermitCard
							key={permit.permitId}
							permit={permit}
							seasonId={seasonId}
							onOpen={onOpenPermit}
						/>
					))}
				</div>
			) : null}
		</section>
	)
}

function PermitCard({
	permit,
	seasonId,
	onOpen,
}: {
	permit: MonitoringPermitGroup
	seasonId: string
	onOpen: () => void
}) {
	const synced = SYNCED_PERMIT_STATUSES.includes(permit.syncStatus)
	const search = new URLSearchParams({ seasonId, permitId: permit.permitId })

	return (
		<Link
			to={`/monitoring?${search.toString()}`}
			className="block rounded-xl border border-base-300 px-3 py-2 transition hover:border-primary/40 hover:bg-primary/5"
			onClick={onOpen}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="truncate text-sm font-semibold">
						Permiso {permit.permitNumber}
					</p>
					<div className="mt-2 flex flex-wrap gap-1.5 text-xs">
						<CountBadge
							label="Participantes"
							value={permit.participantsCount}
							enabled={synced}
						/>
						<CountBadge
							label="Esquila"
							value={permit.shearingRecordsCount}
							enabled={synced}
						/>
						<CountBadge
							label="Fibra"
							value={permit.cleaningRecordsCount}
							enabled={synced}
						/>
					</div>
				</div>
				<span
					className={
						permit.syncStatus === "reopened"
							? "text-warning"
							: synced
								? "text-success"
								: "text-warning"
					}
					title={getStatusLabel(permit.syncStatus)}
				>
					●
				</span>
			</div>
		</Link>
	)
}

function CountBadge({
	label,
	value,
	enabled,
}: {
	label: string
	value: number | null
	enabled: boolean
}) {
	return (
		<span
			className={`badge badge-outline badge-sm ${enabled ? "" : "text-base-content/35"}`}
			title={label}
		>
			{label}: {enabled ? value : "-"}
		</span>
	)
}

function getStatusLabel(status: string) {
	if (status === "reopened") return "Reabierto"
	if (status === "synced") return "Sincronizado"
	return "Pendiente"
}
