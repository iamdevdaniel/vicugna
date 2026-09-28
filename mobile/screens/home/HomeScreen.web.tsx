import { AppShell } from "@components/basics/AppShell.web"
import { useReadPermits } from "@hooks"
import {
	Alert,
	Badge,
	Button,
	Container,
	Group,
	Loader,
	Paper,
	Stack,
	Table,
	Text,
	Title,
} from "@mantine/core"
import { ROUTES } from "@utils/constants"
import { getCommunityName } from "@utils/regionals"
import { Link } from "expo-router"

export default function WebHomeScreen() {
	const { data: permits, loading, error } = useReadPermits()

	return (
		<AppShell>
			<Container size="xl">
				<Stack gap="lg">
					<Group justify="space-between" align="flex-end">
						<div>
							<Title order={1}>Permisos</Title>
							<Text c="dimmed">
								Prueba de persistencia local para Chrome.
							</Text>
						</div>
						<Badge variant="light">Chrome PWA</Badge>
					</Group>

					{error ? <Alert color="red">{error.message}</Alert> : null}
					<Paper withBorder p="md">
						{loading ? (
							<Group justify="center" py="xl">
								<Loader />
							</Group>
						) : (
							<Table>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Permiso</Table.Th>
										<Table.Th>Comunidad</Table.Th>
										<Table.Th>Participantes</Table.Th>
										<Table.Th />
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{permits.map((permit) => (
										<Table.Tr key={permit.id}>
											<Table.Td>
												{permit.permitNumber}
											</Table.Td>
											<Table.Td>
												{getCommunityName(
													permit.communityId,
												)}
											</Table.Td>
											<Table.Td>
												{
													statusLabel[
														permit
															.participantsStatus
													]
												}
											</Table.Td>
											<Table.Td ta="right">
												<Button
													component={Link}
													href={ROUTES.OVERVIEW({
														permitId: permit.id,
														permitNumber:
															permit.permitNumber,
													})}
													variant="light"
												>
													Abrir
												</Button>
											</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
						)}
					</Paper>
				</Stack>
			</Container>
		</AppShell>
	)
}

const statusLabel = {
	ready: "Pendiente",
	done: "Completo",
	disabled: "Bloqueado",
} as const
