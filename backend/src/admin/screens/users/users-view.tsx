import {
	Alert,
	Badge,
	Box,
	Button,
	Container,
	Group,
	Paper,
	Text,
	Title,
} from "@mantine/core"
import { Link } from "react-router"
import type { UserListItem } from "../../../modules/users/user.types"
import { UsersCreateModal } from "./users-create-modal"
import { UsersList } from "./users-list"
import { useUsersState } from "./users-state"

type UsersViewProps = {
	users: UserListItem[]
	suggestedPassword: string
}

export function UsersView(props: UsersViewProps) {
	const state = useUsersState(props)
	const visibleUsers =
		state.activeTab === "users" ? state.regularUsers : state.adminUsers

	return (
		<Container component="main" size="lg" py="xl">
			<header>
				<div>
					<Text size="xs" fw={700} c="dimmed" tt="uppercase">
						Administración
					</Text>
					<Title order={1} mt={4}>
						Usuarios
					</Title>
					<Text mt="xs" size="sm" c="dimmed">
						Gestiona las personas con acceso al sistema.
					</Text>
				</div>
			</header>

			<Paper
				component="section"
				mt="xl"
				withBorder
				shadow="sm"
				style={{ overflow: "hidden" }}
			>
				<Box
					px="lg"
					pt="lg"
					style={{
						borderBottom:
							"1px solid var(--mantine-color-default-border)",
					}}
				>
					<Group mih={48} justify="space-between" gap="md">
						<Title order={2} size="h3">
							Usuarios registrados
						</Title>
						{state.activeTab === "users" ? (
							<Button type="button" onClick={state.openModal}>
								Nuevo encargado
							</Button>
						) : null}
					</Group>
					<Group
						component="nav"
						mt="lg"
						gap="xs"
						aria-label="Tipos de usuario"
					>
						<UserTab
							href="#users"
							label="Encargados"
							count={state.regularUsers.length}
							active={state.activeTab === "users"}
						/>
						<UserTab
							href="#admins"
							label="Administradores"
							count={state.adminUsers.length}
							active={state.activeTab === "admins"}
						/>
					</Group>
				</Box>
				<UsersList
					users={visibleUsers}
					emptyMessage={
						state.activeTab === "users"
							? "No hay encargados creados."
							: "No hay administradores creados."
					}
				/>
			</Paper>

			{state.isModalOpen ? <UsersCreateModal {...state} /> : null}
			{state.successMessage ? (
				<Box
					pos="fixed"
					right={20}
					bottom={20}
					style={{ zIndex: 1000 }}
				>
					<Alert color="green" role="status">
						<Group gap="md" wrap="nowrap">
							<Text size="sm">{state.successMessage}</Text>
							<Button
								type="button"
								variant="subtle"
								size="compact-xs"
								onClick={state.dismissSuccess}
							>
								Cerrar
							</Button>
						</Group>
					</Alert>
				</Box>
			) : null}
		</Container>
	)
}

function UserTab({
	href,
	label,
	count,
	active,
}: {
	href: string
	label: string
	count: number
	active: boolean
}) {
	return (
		<Button
			component={Link}
			to={href}
			preventScrollReset
			variant={active ? "light" : "subtle"}
			color={active ? "sage" : "gray"}
			radius={0}
			style={
				active
					? {
							borderBottom:
								"2px solid var(--mantine-primary-color-filled)",
						}
					: undefined
			}
		>
			{label}
			<Badge ml="xs" size="sm" variant="light" color="gray">
				{count}
			</Badge>
		</Button>
	)
}
