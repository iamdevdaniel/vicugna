import { AppShell } from "@components/basics/AppShell.web"
import { useReadSinglePermit } from "@hooks/web"
import {
	Alert,
	Badge,
	Button,
	Container,
	Group,
	Loader,
	Paper,
	SimpleGrid,
	Stack,
	Text,
	Title,
} from "@mantine/core"
import { ROUTES } from "@utils/constants"
import { Link, useLocalSearchParams } from "expo-router"

export default function WebPermitScreen() {
	const { permitId } = useLocalSearchParams<{ permitId: string }>()
	const { data: permit, loading, error } = useReadSinglePermit(permitId)

	return (
		<AppShell>
			<Container size="xl">
				{loading ? (
					<Group justify="center" py="xl">
						<Loader />
					</Group>
				) : error ? (
					<Alert color="red">{error.message}</Alert>
				) : !permit ? (
					<Alert color="red">El permiso no existe.</Alert>
				) : (
					<Stack gap="lg">
						<div>
							<Title order={1}>{permit.permitNumber}</Title>
							<Text c="dimmed">{permit.seasonName}</Text>
						</div>
						<SimpleGrid cols={{ base: 1, md: 3 }}>
							<StepCard
								title="Participantes"
								status={permit.participantsStatus}
								action={
									<Button
										component={Link}
										href={ROUTES.PARTICIPANTS.OVERVIEW({
											permitId: permit.id,
											permitNumber: permit.permitNumber,
										})}
									>
										Abrir
									</Button>
								}
							/>
							<StepCard
								title="Esquila"
								status={permit.shearingStatus}
							/>
							<StepCard
								title="Registro de fibra"
								status={permit.cleaningStatus}
							/>
						</SimpleGrid>
					</Stack>
				)}
			</Container>
		</AppShell>
	)
}

function StepCard({
	title,
	status,
	action,
}: {
	title: string
	status: "ready" | "done" | "disabled"
	action?: React.ReactNode
}) {
	return (
		<Paper withBorder p="lg">
			<Stack gap="md">
				<Group justify="space-between">
					<Text fw={700}>{title}</Text>
					<Badge color={status === "done" ? "green" : "gray"}>
						{statusLabel[status]}
					</Badge>
				</Group>
				{action}
			</Stack>
		</Paper>
	)
}

const statusLabel = {
	ready: "Pendiente",
	done: "Completo",
	disabled: "Bloqueado",
} as const
