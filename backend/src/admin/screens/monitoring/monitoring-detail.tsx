import {
	ActionIcon,
	Badge,
	Button,
	Grid,
	Group,
	Paper,
	Stack,
	Text,
	Title,
} from "@mantine/core"
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
		<Paper component="article" p="md" withBorder shadow="sm">
			<Paper component="section" p="sm" withBorder>
				<Group
					justify="space-between"
					align="flex-start"
					gap="md"
					wrap="wrap"
				>
					<Group
						align="flex-start"
						gap="sm"
						wrap="nowrap"
						style={{ minWidth: 0 }}
					>
						<ActionIcon
							component={Link}
							to={`/monitoring?${new URLSearchParams({ seasonId }).toString()}`}
							variant="outline"
							size="lg"
							aria-label="Volver al resumen"
						>
							←
						</ActionIcon>
						<div style={{ minWidth: 0 }}>
							<Title order={2} size="h4" lineClamp={1}>
								Permiso {permit.permitNumber}
							</Title>
							<Text truncate size="sm" c="dimmed">
								{permit.communityName}
							</Text>
						</div>
					</Group>

					<Group gap="xs">
						{synced ? (
							<Button
								component={Link}
								to={`/exports/reports/${encodeURIComponent(permit.permitId)}`}
								reloadDocument
								variant="outline"
								size="sm"
							>
								Generar reportes
							</Button>
						) : null}
						{permit.syncStatus === "synced" ? (
							<MonitoringReopenForm permitId={permit.permitId} />
						) : null}
						<StatusBadge permit={permit} />
					</Group>
				</Group>
			</Paper>

			<Grid mt="md">
				<Grid.Col span={{ base: 12, lg: 5 }}>
					<Grid component="section">
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
					</Grid>
				</Grid.Col>
				<Grid.Col span={{ base: 12, lg: 7 }}>
					<Paper component="section" p="sm" withBorder>
						<Title order={3} size="sm">
							Asignados
						</Title>
						<Stack mt="sm" gap="xs">
							{permit.users.map((user) => (
								<Group
									key={user.userId}
									justify="space-between"
									gap="md"
									p="sm"
									wrap="nowrap"
									style={{
										border: "1px solid var(--mantine-color-default-border)",
										borderRadius:
											"var(--mantine-radius-md)",
									}}
								>
									<Text truncate size="sm" fw={500}>
										{user.fullName}
									</Text>
									{user.active ? (
										<Badge color="green" variant="light">
											Principal
										</Badge>
									) : null}
								</Group>
							))}
						</Stack>
					</Paper>
				</Grid.Col>
			</Grid>
		</Paper>
	)
}

function StatusBadge({ permit }: { permit: SelectedMonitoringPermit }) {
	if (permit.syncStatus === "reopened") {
		return (
			<Badge color="yellow" variant="light">
				Reabierto
			</Badge>
		)
	}
	if (permit.syncStatus === "synced") {
		return (
			<Badge color="green" variant="light">
				{permit.syncedAtLabel}
			</Badge>
		)
	}
	return (
		<Badge color="yellow" variant="light">
			Pendiente
		</Badge>
	)
}

function DetailCount({
	label,
	value,
}: {
	label: string
	value: number | null
}) {
	return (
		<Grid.Col span={{ base: 12, sm: 4, lg: 12 }}>
			<Paper p="sm" withBorder>
				<Text size="sm" c="dimmed">
					{label}
				</Text>
				<Text mt="xs" size="xl" fw={600}>
					{value ?? "-"}
				</Text>
			</Paper>
		</Grid.Col>
	)
}
