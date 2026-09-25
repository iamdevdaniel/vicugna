import { Badge, Group, NativeSelect, Paper } from "@mantine/core"
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
		<Paper component="section" mt="xl" p="md" withBorder shadow="sm">
			<Form
				method="get"
				style={{
					display: "flex",
					flexWrap: "wrap",
					alignItems: "flex-end",
					justifyContent: "space-between",
					gap: 16,
				}}
			>
				<NativeSelect
					label="Temporada"
					name="seasonId"
					value={selectedSeasonId}
					style={{ width: "100%", maxWidth: 320 }}
					onChange={(event) =>
						event.currentTarget.form?.requestSubmit()
					}
				>
					{seasons.map((season) => (
						<option key={season.id} value={season.id}>
							{season.name}
						</option>
					))}
				</NativeSelect>

				<Group gap="xs">
					<Badge size="lg" variant="light" color="orange">
						{communitiesWithPermitsCount} comunidades
					</Badge>
					<Badge size="lg" variant="light" color="orange">
						{permitsCount} permisos
					</Badge>
				</Group>
			</Form>
		</Paper>
	)
}
