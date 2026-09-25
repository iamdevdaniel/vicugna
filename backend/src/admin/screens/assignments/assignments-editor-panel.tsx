import {
	ActionIcon,
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
import type { EditableAssignmentUser } from "./assignments-state"
import type { AssignmentActionData } from "./assignments-types"

type AssignmentEditorPanelProps = {
	fetcher: FetcherWithComponents<AssignmentActionData>
	selectedSeasonId: string
	selectedPermit?: PermitListItem
	editableUsers: EditableAssignmentUser[]
	eligibleUsers: ManagedUserOption[]
	selectedUserId: string
	userSearch: string
	isRenaming: boolean
	permitNameDraft: string
	hasDirtyDraft: boolean
	isSubmitting: boolean
	onMutationStart: () => boolean
	onBeginRename: () => void
	onCancelRename: () => void
	onPermitNameChange: (value: string) => void
	onSelectedUserChange: (value: string) => void
	onUserSearchChange: (value: string) => void
	onAddUser: () => void
	onRemoveUser: (userId: string) => void
	onSetPrincipal: (userId: string) => void
	onMoveUser: (userId: string, offset: -1 | 1) => void
	onDiscardDraft: () => void
}

export function AssignmentEditorPanel({
	fetcher,
	selectedSeasonId,
	selectedPermit,
	editableUsers,
	eligibleUsers,
	selectedUserId,
	userSearch,
	isRenaming,
	permitNameDraft,
	hasDirtyDraft,
	isSubmitting,
	onMutationStart,
	onBeginRename,
	onCancelRename,
	onPermitNameChange,
	onSelectedUserChange,
	onUserSearchChange,
	onAddUser,
	onRemoveUser,
	onSetPrincipal,
	onMoveUser,
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

					<Group mt="md" align="flex-end" gap="xs" wrap="nowrap">
						<NativeSelect
							label="Encargado"
							style={{ flex: 1 }}
							value={selectedUserId}
							onChange={(event) =>
								onSelectedUserChange(event.target.value)
							}
							disabled={isSubmitting}
						>
							<option value="">Selecciona un encargado</option>
							{eligibleUsers.map((user) => (
								<option key={user.id} value={user.id}>
									{user.name}
								</option>
							))}
						</NativeSelect>
						<Button
							type="button"
							variant="outline"
							onClick={onAddUser}
							disabled={!selectedUserId || isSubmitting}
						>
							Añadir
						</Button>
					</Group>
					<TextInput
						type="search"
						value={userSearch}
						onChange={(event) =>
							onUserSearchChange(event.target.value)
						}
						placeholder="Filtrar encargados disponibles"
						disabled={isSubmitting}
					/>

					<Stack gap="xs">
						{editableUsers.length ? (
							editableUsers.map((user, index) => (
								<AssignedUserRow
									key={user.userId}
									user={user}
									index={index}
									usersCount={editableUsers.length}
									isSubmitting={isSubmitting}
									onMove={onMoveUser}
									onRemove={onRemoveUser}
									onSetPrincipal={onSetPrincipal}
								/>
							))
						) : (
							<Text py="lg" ta="center" size="sm" c="dimmed">
								Aún no hay encargados asignados.
							</Text>
						)}
					</Stack>

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
						<input
							type="hidden"
							name="activeUserId"
							value={
								editableUsers.find((user) => user.active)
									?.userId ?? ""
							}
						/>
						{editableUsers.map((user) => (
							<input
								key={user.userId}
								type="hidden"
								name="userIds"
								value={user.userId}
							/>
						))}
						<Group gap="xs" grow>
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
									editableUsers.length === 0 ||
									isSubmitting
								}
							>
								{isSubmitting
									? "Guardando..."
									: "Guardar asignaciones"}
							</Button>
						</Group>
					</fetcher.Form>
				</Stack>
			) : (
				<Text py={48} ta="center" size="sm" c="dimmed">
					Selecciona un permiso para configurar sus encargados.
				</Text>
			)}
		</Paper>
	)
}

function AssignedUserRow({
	user,
	index,
	usersCount,
	isSubmitting,
	onMove,
	onRemove,
	onSetPrincipal,
}: {
	user: EditableAssignmentUser
	index: number
	usersCount: number
	isSubmitting: boolean
	onMove: (userId: string, offset: -1 | 1) => void
	onRemove: (userId: string) => void
	onSetPrincipal: (userId: string) => void
}) {
	return (
		<Group
			p="sm"
			justify="space-between"
			gap="sm"
			wrap="wrap"
			style={{
				border: "1px solid var(--mantine-color-default-border)",
				borderRadius: "var(--mantine-radius-md)",
			}}
		>
			<Text truncate size="sm">
				{user.userFullName}
			</Text>
			<Group gap={4} justify="flex-end">
				<ActionIcon
					type="button"
					variant="subtle"
					size="sm"
					onClick={() => onMove(user.userId, -1)}
					disabled={index === 0 || isSubmitting}
					aria-label={`Subir ${user.userFullName}`}
				>
					↑
				</ActionIcon>
				<ActionIcon
					type="button"
					variant="subtle"
					size="sm"
					onClick={() => onMove(user.userId, 1)}
					disabled={index === usersCount - 1 || isSubmitting}
					aria-label={`Bajar ${user.userFullName}`}
				>
					↓
				</ActionIcon>
				<Button
					type="button"
					variant={user.active ? "light" : "subtle"}
					color={user.active ? "green" : "gray"}
					size="compact-xs"
					onClick={() => onSetPrincipal(user.userId)}
					disabled={user.active || isSubmitting}
				>
					Principal
				</Button>
				<Button
					type="button"
					variant="subtle"
					color="red"
					size="compact-xs"
					onClick={() => onRemove(user.userId)}
					disabled={isSubmitting}
				>
					Quitar
				</Button>
			</Group>
		</Group>
	)
}
