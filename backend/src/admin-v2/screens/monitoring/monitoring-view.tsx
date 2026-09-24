import type { MonitoringPageData } from "../../../modules/monitoring/monitoring.types"
import { MonitoringDetail } from "./monitoring-detail"
import { MonitoringOverview } from "./monitoring-overview"
import { MonitoringSummary } from "./monitoring-summary"
import type { MonitoringActionData } from "./monitoring-types"

type MonitoringPageState = Omit<
	MonitoringPageData,
	| "pageTitle"
	| "adminUser"
	| "syncedStatuses"
	| "formMessage"
	| "formMessageType"
>

type MonitoringViewProps = {
	pageData: MonitoringPageState
	actionData?: MonitoringActionData
}

export function MonitoringView({ pageData, actionData }: MonitoringViewProps) {
	return (
		<main className="mx-auto flex w-full max-w-6xl flex-col px-5 py-8 lg:min-h-0">
			<header>
				<p className="text-xs font-bold uppercase tracking-wide text-base-content/55">
					Administración
				</p>
				<h1 className="mt-1 text-3xl font-semibold">Seguimiento</h1>
				<p className="mt-2 text-sm text-base-content/60">
					Revisa el avance, la sincronización y los reportes de cada
					permiso.
				</p>
			</header>

			<MonitoringSummary
				seasons={pageData.seasons}
				selectedSeasonId={pageData.selectedSeasonId}
				communitiesCount={pageData.communitiesCount}
				permitsCount={pageData.permitsCount}
				assignedUsersCount={pageData.assignedUsersCount}
			/>

			{actionData ? (
				<div
					className={`alert mt-4 ${actionData.ok ? "alert-success" : "alert-error"}`}
					role={actionData.ok ? "status" : "alert"}
				>
					{actionData.message}
				</div>
			) : null}

			<section className="mt-4 lg:min-h-0 lg:flex-1">
				{pageData.selectedPermit ? (
					<MonitoringDetail
						permit={pageData.selectedPermit}
						seasonId={pageData.selectedSeasonId}
					/>
				) : pageData.communityGroups.length > 0 ? (
					<MonitoringOverview
						seasonId={pageData.selectedSeasonId}
						communityGroups={pageData.communityGroups}
					/>
				) : (
					<div className="flex min-h-72 items-center justify-center rounded-box border border-base-300 bg-base-100 p-6 shadow-sm">
						<p className="text-sm text-base-content/55">
							No hay asignaciones para esta temporada.
						</p>
					</div>
				)}
			</section>
		</main>
	)
}
