import { AppShell } from "@components/basics/AppShell.web"
import { ParticipantTable } from "@components/participants/ParticipantTable.web"
import { useReadBulkParticipants, useReadSinglePermit } from "@hooks/web"
import {
	Alert,
	Container,
	Group,
	Loader,
	Paper,
	Stack,
	Text,
	Title,
} from "@mantine/core"
import { useLocalSearchParams } from "expo-router"

export default function WebParticipantsScreen() {
	const { permitId } = useLocalSearchParams<{ permitId: string }>()
	const permit = useReadSinglePermit(permitId)
	const participants = useReadBulkParticipants(permitId)
	const error = permit.error ?? participants.error

	return (
		<AppShell>
			<Container size="xl">
				<Stack gap="lg">
					<div>
						<Title order={1}>Participantes</Title>
						<Text c="dimmed">
							{permit.data?.permitNumber ?? "Permiso"}
						</Text>
					</div>
					{error ? <Alert color="red">{error.message}</Alert> : null}
					<Paper withBorder p="md">
						{permit.loading || participants.loading ? (
							<Group justify="center" py="xl">
								<Loader />
							</Group>
						) : permit.data ? (
							<ParticipantTable
								permitId={permitId}
								participants={participants.data}
								readOnly={permit.data.syncStatus === "synced"}
							/>
						) : (
							<Alert color="red">El permiso no existe.</Alert>
						)}
					</Paper>
				</Stack>
			</Container>
		</AppShell>
	)
}
