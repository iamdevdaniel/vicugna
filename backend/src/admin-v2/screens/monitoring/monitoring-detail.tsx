import { Link } from "react-router"
import { SYNCED_PERMIT_STATUSES } from "../../../modules/common/common.constants"
import type { SelectedMonitoringPermit } from "../../../modules/monitoring/monitoring.types"
import { MonitoringReopenForm } from "./monitoring-reopen-form"

type MonitoringDetailProps = {
	permit: SelectedMonitoringPermit
	seasonId: string
}

export function MonitoringDetail({ permit, seasonId }: MonitoringDetailProps) {
	const synced = SYNCED_PERMIT_STATUSES.includes(permit.syncStatus)

	return (
		<article className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm lg:h-full lg:min-h-0">
			<section className="flex flex-col gap-3 rounded-xl border border-base-300 p-3 md:flex-row md:items-start md:justify-between">
				<div className="flex min-w-0 items-start gap-3">
					<Link
						to={`/monitoring?${new URLSearchParams({ seasonId }).toString()}`}
						className="btn btn-circle btn-outline btn-sm"
						aria-label="Volver al resumen"
					>
						←
					</Link>
					<div className="min-w-0">
						<h2 className="truncate font-semibold">
							Permiso {permit.permitNumber}
						</h2>
						<p className="truncate text-sm text-base-content/60">
							{permit.communityName}
						</p>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2 md:justify-end">
					{synced ? (
						<Link
							to={`/exports/reports/${encodeURIComponent(permit.permitId)}`}
							reloadDocument
							className="btn btn-outline btn-sm"
						>
							Generar reportes
						</Link>
					) : null}
					{permit.syncStatus === "synced" ? (
						<MonitoringReopenForm permitId={permit.permitId} />
					) : null}
					<StatusBadge permit={permit} />
				</div>
			</section>

			<div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
				<section className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
					<DetailCount
						label="Participantes"
						value={permit.participantsCount}
					/>
					<DetailCount
						label="Registros de esquila"
						value={permit.shearingRecordsCount}
					/>
					<DetailCount
						label="Registros de fibra"
						value={permit.cleaningRecordsCount}
					/>
				</section>
				<section className="rounded-xl border border-base-300 p-3">
					<h3 className="text-sm font-semibold">Asignados</h3>
					<div className="mt-3 flex flex-col gap-2">
						{permit.users.map((user) => (
							<div
								key={user.userId}
								className="flex items-center justify-between gap-3 rounded-xl border border-base-300 px-3 py-2"
							>
								<p className="truncate text-sm font-medium">
									{user.fullName}
								</p>
								{user.active ? (
									<span className="badge badge-success badge-soft">
										Principal
									</span>
								) : null}
							</div>
						))}
					</div>
				</section>
			</div>
		</article>
	)
}

function StatusBadge({ permit }: { permit: SelectedMonitoringPermit }) {
	if (permit.syncStatus === "reopened") {
		return <span className="badge badge-warning badge-soft">Reabierto</span>
	}
	if (permit.syncStatus === "synced") {
		return (
			<span className="badge badge-success badge-soft">
				{permit.syncedAtLabel}
			</span>
		)
	}
	return <span className="badge badge-warning badge-soft">Pendiente</span>
}

function DetailCount({
	label,
	value,
}: {
	label: string
	value: number | null
}) {
	return (
		<div className="rounded-xl border border-base-300 p-3">
			<p className="text-sm text-base-content/65">{label}</p>
			<p className="mt-2 text-2xl font-semibold">{value ?? "-"}</p>
		</div>
	)
}
