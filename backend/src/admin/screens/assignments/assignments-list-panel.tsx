import {
	Badge,
	Group,
	Paper,
	ScrollArea,
	Stack,
	Text,
	TextInput,
	Title,
	UnstyledButton,
} from "@mantine/core"
import type { AssignmentPermitCard } from "../../../modules/assignments/assignment.types"

type AssignmentsListPanelProps = {
	selectedCommunityId: string
	selectedPermitId: string
	assignmentSearch: string
	assignmentCards: AssignmentPermitCard[]
	isSubmitting: boolean
	onSearchChange: (value: string) => void
	onSelectPermit: (permitId: string) => void
}

export function AssignmentsListPanel({
	selectedCommunityId,
	selectedPermitId,
	assignmentSearch,
	assignmentCards,
	isSubmitting,
	onSearchChange,
	onSelectPermit,
}: AssignmentsListPanelProps) {
	return (
		<Paper component="article" p="md" withBorder shadow="sm">
			<Title order={2} size="h4">
				Asignaciones actuales
			</Title>
			<TextInput
				mt="md"
				label="Buscar"
				type="search"
				value={assignmentSearch}
				onChange={(event) => onSearchChange(event.target.value)}
				placeholder="Permiso o encargado"
				disabled={!selectedCommunityId || isSubmitting}
			/>

			<ScrollArea.Autosize mt="md" mah={384}>
				<Stack gap="xs">
					{!selectedCommunityId ? (
						<EmptyState>Selecciona una comunidad.</EmptyState>
					) : assignmentCards.length === 0 ? (
						<EmptyState>No se encontraron asignaciones.</EmptyState>
					) : (
						assignmentCards.map((card) => (
							<UnstyledButton
								key={card.permitId}
								type="button"
								p="sm"
								style={{
									border: `1px solid ${card.permitId === selectedPermitId ? "var(--mantine-primary-color-filled)" : "var(--mantine-color-default-border)"}`,
									borderRadius: "var(--mantine-radius-md)",
									background:
										card.permitId === selectedPermitId
											? "var(--mantine-primary-color-light)"
											: "transparent",
								}}
								onClick={() => onSelectPermit(card.permitId)}
								disabled={isSubmitting}
							>
								<Group
									justify="space-between"
									align="flex-start"
									gap="md"
									wrap="nowrap"
								>
									<Text size="sm" fw={600}>
										Permiso {card.permitNumber}
									</Text>
									<Badge variant="outline" size="sm">
										{card.users.length === 1
											? "1 usuario"
											: `${card.users.length} usuarios`}
									</Badge>
								</Group>
								<Stack mt="xs" gap={4}>
									{card.users.map((user) => (
										<Text
											key={user.assignmentId}
											truncate
											size="sm"
											fw={user.active ? 600 : undefined}
											c={user.active ? "green" : "dimmed"}
										>
											{user.userFullName}
											{user.active ? " · Principal" : ""}
										</Text>
									))}
								</Stack>
							</UnstyledButton>
						))
					)}
				</Stack>
			</ScrollArea.Autosize>
		</Paper>
	)
}

function EmptyState({ children }: { children: string }) {
	return (
		<Text px="sm" py="xl" ta="center" size="sm" c="dimmed">
			{children}
		</Text>
	)
}
