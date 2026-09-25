import {
	Badge,
	Button,
	Group,
	NativeSelect,
	Paper,
	ScrollArea,
	Stack,
	Text,
	TextInput,
	Title,
	UnstyledButton,
} from "@mantine/core"
import { useRef } from "react"
import { useForm } from "react-hook-form"
import type { FetcherWithComponents } from "react-router"
import type {
	PermitListItem,
	SelectOption,
} from "../../../modules/assignments/assignment.types"
import type { AssignmentActionData } from "./assignments-types"

type PermitsPanelProps = {
	fetcher: FetcherWithComponents<AssignmentActionData>
	selectedSeasonId: string
	communities: SelectOption[]
	permits: PermitListItem[]
	selectedCommunityId: string
	selectedPermitId: string
	permitSearch: string
	newPermitNumber: string
	visiblePermits: PermitListItem[]
	hasConflictingChanges: boolean
	isSubmitting: boolean
	onMutationStart: () => boolean
	assignedUsersCount: (permitId: string) => number
	onSelectCommunity: (communityId: string) => void
	onSelectPermit: (permitId: string) => void
	onPermitSearchChange: (value: string) => void
	onNewPermitNumberChange: (value: string) => void
}

export function PermitsPanel({
	fetcher,
	selectedSeasonId,
	communities,
	permits,
	selectedCommunityId,
	selectedPermitId,
	permitSearch,
	newPermitNumber,
	visiblePermits,
	hasConflictingChanges,
	isSubmitting,
	onMutationStart,
	assignedUsersCount,
	onSelectCommunity,
	onSelectPermit,
	onPermitSearchChange,
	onNewPermitNumberChange,
}: PermitsPanelProps) {
	const formRef = useRef<HTMLFormElement>(null)
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<{ permitNumber: string }>({
		mode: "onChange",
		values: { permitNumber: newPermitNumber },
	})
	const permitNumberField = register("permitNumber", {
		required: "El número de permiso es obligatorio",
		onChange: (event) => onNewPermitNumberChange(event.target.value),
	})
	const submitPermit = handleSubmit(() => {
		if (!formRef.current || !onMutationStart()) return
		fetcher.submit(formRef.current)
	})

	return (
		<Paper component="article" p="md" withBorder shadow="sm">
			<Title order={2} size="h4">
				Crear permiso
			</Title>
			<NativeSelect
				mt="md"
				label="Comunidad"
				value={selectedCommunityId}
				onChange={(event) => onSelectCommunity(event.target.value)}
				disabled={isSubmitting}
			>
				<option value="">Selecciona una comunidad</option>
				{communities.map((community) => (
					<option key={community.id} value={community.id}>
						{community.name} (
						{countCommunityPermits(permits, community.id)})
					</option>
				))}
			</NativeSelect>

			<fetcher.Form
				ref={formRef}
				method="post"
				style={{ marginTop: 12 }}
				onSubmit={submitPermit}
				noValidate
			>
				<input type="hidden" name="intent" value="create-permit" />
				<input type="hidden" name="seasonId" value={selectedSeasonId} />
				<input
					type="hidden"
					name="communityId"
					value={selectedCommunityId}
				/>
				<Group align="flex-end" gap={0} wrap="nowrap">
					<TextInput
						label="Nuevo permiso"
						style={{ flex: 1 }}
						styles={{
							input: {
								borderTopRightRadius: 0,
								borderBottomRightRadius: 0,
							},
						}}
						{...permitNumberField}
						value={newPermitNumber}
						placeholder="Número de permiso"
						disabled={!selectedCommunityId || isSubmitting}
						aria-invalid={Boolean(errors.permitNumber)}
					/>
					<Button
						type="submit"
						style={{
							borderTopLeftRadius: 0,
							borderBottomLeftRadius: 0,
						}}
						disabled={
							!selectedCommunityId ||
							!newPermitNumber.trim() ||
							hasConflictingChanges ||
							isSubmitting
						}
					>
						{isSubmitting ? "Guardando..." : "Crear"}
					</Button>
				</Group>
				{errors.permitNumber ? (
					<Text mt={4} c="red" size="sm" role="alert">
						{errors.permitNumber.message}
					</Text>
				) : null}
			</fetcher.Form>

			<TextInput
				mt="sm"
				label="Buscar permiso"
				type="search"
				value={permitSearch}
				onChange={(event) => onPermitSearchChange(event.target.value)}
				placeholder="Número de permiso"
				disabled={!selectedCommunityId}
			/>

			<ScrollArea.Autosize mt="md" mah={384}>
				<Stack gap="xs">
					<PermitListState
						hasSeasonPermits={permits.length > 0}
						hasCommunity={Boolean(selectedCommunityId)}
						hasVisiblePermits={visiblePermits.length > 0}
					/>
					{visiblePermits.map((permit) => (
						<UnstyledButton
							key={permit.id}
							type="button"
							p="sm"
							style={{
								border: `1px solid ${permit.id === selectedPermitId ? "var(--mantine-primary-color-filled)" : "var(--mantine-color-default-border)"}`,
								borderRadius: "var(--mantine-radius-md)",
								background:
									permit.id === selectedPermitId
										? "var(--mantine-primary-color-light)"
										: "transparent",
							}}
							onClick={() => onSelectPermit(permit.id)}
							disabled={isSubmitting}
						>
							<Group
								justify="space-between"
								gap="md"
								wrap="nowrap"
							>
								<Text truncate size="sm" fw={600}>
									{permit.permitNumber}
								</Text>
								<Badge variant="light" color="gray" size="sm">
									{assignedUsersCount(permit.id)}
								</Badge>
							</Group>
						</UnstyledButton>
					))}
				</Stack>
			</ScrollArea.Autosize>
		</Paper>
	)
}

function PermitListState({
	hasSeasonPermits,
	hasCommunity,
	hasVisiblePermits,
}: {
	hasSeasonPermits: boolean
	hasCommunity: boolean
	hasVisiblePermits: boolean
}) {
	if (!hasSeasonPermits)
		return <EmptyState>Aún no hay permisos para esta temporada.</EmptyState>
	if (!hasCommunity) return <EmptyState>Selecciona una comunidad.</EmptyState>
	if (!hasVisiblePermits)
		return <EmptyState>No se encontraron permisos.</EmptyState>
	return null
}

function EmptyState({ children }: { children: string }) {
	return (
		<Text px="sm" py="xl" ta="center" size="sm" c="dimmed">
			{children}
		</Text>
	)
}

function countCommunityPermits(permits: PermitListItem[], communityId: string) {
	return permits.filter((permit) => permit.communityId === communityId).length
}
