import { Badge, Group, NativeSelect, Paper } from "@mantine/core"
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
					style={{ width: "100%", maxWidth: 320 }}
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
				</NativeSelect>

				<Group gap="xs">
					<SummaryCount
						value={communitiesCount}
						label="comunidades"
					/>
					<SummaryCount value={permitsCount} label="permisos" />
					<SummaryCount
						value={assignedUsersCount}
						label="encargados"
					/>
				</Group>
			</Form>
		</Paper>
	)
}

function SummaryCount({ value, label }: { value: number; label: string }) {
	return (
		<Badge size="lg" variant="light" color="orange">
			{value} {label}
		</Badge>
	)
}
