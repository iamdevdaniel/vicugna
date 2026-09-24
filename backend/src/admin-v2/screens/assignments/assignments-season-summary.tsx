import { Form } from "react-router"
import type { SelectOption } from "../../../modules/assignments/assignment.types"

type SeasonSummaryProps = {
	seasons: SelectOption[]
	selectedSeasonId: string
	communitiesWithPermitsCount: number
	permitsCount: number
}

export function AssignmentsSeasonSummary({
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
