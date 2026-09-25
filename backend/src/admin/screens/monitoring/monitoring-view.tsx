import { Alert, Container, Paper, Text, Title } from "@mantine/core"
import type { MonitoringPageState } from "../../../modules/monitoring/monitoring.types"
import { MonitoringDetail } from "./monitoring-detail"
import { MonitoringOverview } from "./monitoring-overview"
import { MonitoringSummary } from "./monitoring-summary"
import type { MonitoringActionData } from "./monitoring-types"

type MonitoringViewProps = {
	pageData: MonitoringPageState
	actionData?: MonitoringActionData
}

export function MonitoringView({ pageData, actionData }: MonitoringViewProps) {
	return (
		<Container component="main" size="lg" py="xl">
			<header>
				<Text size="xs" fw={700} c="dimmed" tt="uppercase">
					Administración
				</Text>
				<Title order={1} mt={4}>
					Seguimiento
				</Title>
				<Text mt="xs" size="sm" c="dimmed">
					Revisa el avance, la sincronización y los reportes de cada
					permiso.
				</Text>
			</header>

			<MonitoringSummary
				seasons={pageData.seasons}
				selectedSeasonId={pageData.selectedSeasonId}
				communitiesCount={pageData.communitiesCount}
				permitsCount={pageData.permitsCount}
				assignedUsersCount={pageData.assignedUsersCount}
			/>

			{actionData ? (
				<Alert
					mt="md"
					color={actionData.ok ? "green" : "red"}
					role={actionData.ok ? "status" : "alert"}
				>
					{actionData.message}
				</Alert>
			) : null}

			<section style={{ marginTop: 16 }}>
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
					<Paper
						mih={288}
						p="xl"
						withBorder
						shadow="sm"
						display="flex"
						style={{
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Text size="sm" c="dimmed">
							No hay asignaciones para esta temporada.
						</Text>
					</Paper>
				)}
			</section>
		</Container>
	)
}
