import { Form } from "react-router"
import type { MonitoringSeasonOption } from "../../../modules/monitoring/monitoring.types"

type MonitoringSummaryProps = {
	seasons: MonitoringSeasonOption[]
	selectedSeasonId: string
	communitiesCount: number
	permitsCount: number
	assignedUsersCount: number
}

export function MonitoringSummary({
	seasons,
	selectedSeasonId,
	communitiesCount,
	permitsCount,
	assignedUsersCount,
}: MonitoringSummaryProps) {
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
					<SummaryCount
						value={communitiesCount}
						label="comunidades"
					/>
					<SummaryCount value={permitsCount} label="permisos" />
					<SummaryCount
						value={assignedUsersCount}
						label="encargados"
					/>
				</div>
			</Form>
		</section>
	)
}

function SummaryCount({ value, label }: { value: number; label: string }) {
	return (
		<span className="badge badge-lg badge-soft badge-accent">
			{value} {label}
		</span>
	)
}
