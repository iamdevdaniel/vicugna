import {
	Button,
	Group,
	NativeSelect,
	Paper,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core"
import { useRef } from "react"
import { useForm } from "react-hook-form"
import type { FetcherWithComponents } from "react-router"
import type {
	ManagedUserOption,
	PermitListItem,
} from "../../../modules/assignments/assignment.types"
import type { AssignmentActionData } from "./assignments-types"

type AssignmentEditorPanelProps = {
	fetcher: FetcherWithComponents<AssignmentActionData>
	selectedSeasonId: string
	selectedPermit?: PermitListItem
	users: ManagedUserOption[]
	assignedUserId: string
	canChangeAssignment: boolean
	isRenaming: boolean
	permitNameDraft: string
	hasDirtyDraft: boolean
	isSubmitting: boolean
	onMutationStart: () => boolean
	onBeginRename: () => void
	onCancelRename: () => void
	onPermitNameChange: (value: string) => void
	onAssignedUserChange: (value: string) => void
	onDiscardDraft: () => void
}

export function AssignmentEditorPanel({
	fetcher,
	selectedSeasonId,
	selectedPermit,
	users,
	assignedUserId,
	canChangeAssignment,
	isRenaming,
	permitNameDraft,
	hasDirtyDraft,
	isSubmitting,
	onMutationStart,
	onBeginRename,
	onCancelRename,
	onPermitNameChange,
	onAssignedUserChange,
	onDiscardDraft,
}: AssignmentEditorPanelProps) {
	const renameFormRef = useRef<HTMLFormElement>(null)
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<{ permitNumber: string }>({
		mode: "onChange",
		values: { permitNumber: permitNameDraft },
	})
	const permitNumberField = register("permitNumber", {
		required: "El número de permiso es obligatorio",
		onChange: (event) => onPermitNameChange(event.target.value),
	})
	const submitRename = handleSubmit(() => {
		if (!renameFormRef.current || !onMutationStart()) return
		fetcher.submit(renameFormRef.current)
	})

	return (
		<Paper component="article" p="md" withBorder shadow="sm">
			<Title order={2} size="h4">
				Configurar permiso
			</Title>
			{selectedPermit ? (
				<Stack mt="md" gap="xs">
					{isRenaming ? (
						<fetcher.Form
							ref={renameFormRef}
							method="post"
							style={{
								display: "flex",
								flexWrap: "wrap",
								gap: 8,
							}}
							onSubmit={submitRename}
							noValidate
						>
							<input
								type="hidden"
								name="intent"
								value="rename-permit"
							/>
							<input
								type="hidden"
								name="seasonId"
								value={selectedSeasonId}
							/>
							<input
								type="hidden"
								name="communityId"
								value={selectedPermit.communityId}
							/>
							<input
								type="hidden"
								name="permitId"
								value={selectedPermit.id}
							/>
							<TextInput
								style={{ minWidth: 192, flex: 1 }}
								{...permitNumberField}
								value={permitNameDraft}
								disabled={isSubmitting}
								error={errors.permitNumber?.message}
							/>
							<Button
								type="submit"
								disabled={
									!permitNameDraft.trim() ||
									permitNameDraft.trim() ===
										selectedPermit.permitNumber ||
									isSubmitting
								}
							>
								Guardar
							</Button>
							<Button
								type="button"
								variant="subtle"
								onClick={onCancelRename}
								disabled={isSubmitting}
							>
								Cancelar
							</Button>
						</fetcher.Form>
					) : (
						<Group justify="space-between" gap="md" wrap="nowrap">
							<Text truncate size="xl" fw={600}>
								{selectedPermit.permitNumber}
							</Text>
							<Button
								type="button"
								variant="subtle"
								size="sm"
								onClick={onBeginRename}
								disabled={isSubmitting}
							>
								Renombrar
							</Button>
						</Group>
					)}
					<Text size="sm" c="dimmed">
						{selectedPermit.communityName}
					</Text>

					<fetcher.Form
						method="post"
						style={{ marginTop: 8 }}
						onSubmit={(event) => {
							if (!onMutationStart()) event.preventDefault()
						}}
					>
						<input
							type="hidden"
							name="intent"
							value="save-assignments"
						/>
						<input
							type="hidden"
							name="seasonId"
							value={selectedSeasonId}
						/>
						<input
							type="hidden"
							name="communityId"
							value={selectedPermit.communityId}
						/>
						<input
							type="hidden"
							name="permitId"
							value={selectedPermit.id}
						/>
						<NativeSelect
							label="Encargado responsable"
							name="userId"
							value={assignedUserId}
							onChange={(event) =>
								onAssignedUserChange(event.target.value)
							}
							disabled={!canChangeAssignment || isSubmitting}
						>
							<option value="">Sin encargado</option>
							{users.map((user) => (
								<option key={user.id} value={user.id}>
									{user.name}
								</option>
							))}
						</NativeSelect>
						{!canChangeAssignment ? (
							<Text mt="xs" size="sm" c="dimmed">
								El encargado no puede cambiarse después de
								descargar el permiso.
							</Text>
						) : null}
						<Group mt="md" gap="xs" grow>
							<Button
								type="button"
								variant="subtle"
								onClick={onDiscardDraft}
								disabled={!hasDirtyDraft || isSubmitting}
							>
								Descartar
							</Button>
							<Button
								type="submit"
								disabled={
									!hasDirtyDraft ||
									!canChangeAssignment ||
									isSubmitting
								}
							>
								{isSubmitting
									? "Guardando..."
									: "Guardar encargado"}
							</Button>
						</Group>
					</fetcher.Form>
				</Stack>
			) : (
				<Text py={48} ta="center" size="sm" c="dimmed">
					Selecciona un permiso para configurar su encargado.
				</Text>
			)}
		</Paper>
	)
}
