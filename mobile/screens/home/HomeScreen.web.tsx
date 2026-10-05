import { AppShell } from "@components/basics/AppShell.web"
import { useLoadPermits, useReadPermits } from "@hooks/web"
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
import { useMessageStore } from "@utils/message-store.web"
import { getCommunityName } from "@utils/regionals"
import { Link } from "expo-router"

export default function WebHomeScreen() {
	const { data: permits, loading, error } = useReadPermits()
	const { loadPermits, loadingPermits } = useLoadPermits()
	const showMessage = useMessageStore((state) => state.showMessage)

	const downloadPermits = async () => {
		const result = await loadPermits()
		if ("cancelled" in result) return

		if (result.ok) {
			showMessage(
				result.backupStatus === "ready" ? "success" : "info",
				result.backupStatus === "ready"
					? "Permisos actualizados y respaldados"
					: "Permisos guardados localmente; copia pendiente",
			)
		} else {
			showMessage("error", result.error)
		}
	}

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
						<Group>
							<Badge variant="light">Chrome PWA</Badge>
							<Button
								onClick={() => void downloadPermits()}
								loading={loadingPermits}
							>
								Actualizar permisos
							</Button>
						</Group>
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
									{permits.length === 0 ? (
										<Table.Tr>
											<Table.Td colSpan={4}>
												<Text
													ta="center"
													c="dimmed"
													py="xl"
												>
													Actualice los permisos para
													comenzar.
												</Text>
											</Table.Td>
										</Table.Tr>
									) : null}
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
