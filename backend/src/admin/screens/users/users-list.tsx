import { Avatar, Badge, Box, Divider, Group, Stack, Text } from "@mantine/core"
import type { UserListItem } from "../../../modules/users/user.types"

type UsersListProps = { users: UserListItem[]; emptyMessage: string }

export function UsersList({ users, emptyMessage }: UsersListProps) {
	if (users.length === 0)
		return (
			<Text px="lg" py="xl" size="sm" c="dimmed">
				{emptyMessage}
			</Text>
		)

	return (
		<Stack gap={0}>
			{users.map((user, index) => (
				<Box key={user.id}>
					<Group
						component="article"
						justify="space-between"
						align="center"
						gap="md"
						px="lg"
						py="md"
						wrap="wrap"
					>
						<Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
							<Avatar color="orange" variant="light" fw={700}>
								{getInitials(user.fullName)}
							</Avatar>
							<Box style={{ minWidth: 0 }}>
								<Text component="h3" truncate fw={600}>
									{user.fullName}
								</Text>
								<Text size="sm" c="dimmed">
									{user.phoneNumber}{" "}
									<Text span c="gray.5" px="xs">
										•
									</Text>
									{user.email || "Sin correo"}
								</Text>
							</Box>
						</Group>
						<Badge
							color={user.isActive ? "green" : "gray"}
							variant="light"
						>
							{user.isActive ? "Activo" : "Inactivo"}
						</Badge>
					</Group>
					{index < users.length - 1 ? <Divider /> : null}
				</Box>
			))}
		</Stack>
	)
}

function getInitials(fullName: string) {
	return fullName
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("")
}
