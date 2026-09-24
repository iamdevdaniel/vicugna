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
		<article className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
			<h2 className="text-base font-semibold">Configurar permiso</h2>
			{selectedPermit ? (
				<div className="mt-4">
					{isRenaming ? (
						<fetcher.Form
							ref={renameFormRef}
							method="post"
							className="flex flex-wrap gap-2"
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
							<input
								className="input input-bordered min-w-48 flex-1"
								{...permitNumberField}
								value={permitNameDraft}
								disabled={isSubmitting}
								aria-invalid={Boolean(errors.permitNumber)}
							/>
							{errors.permitNumber ? (
								<p
									className="w-full text-error text-sm"
									role="alert"
								>
									{errors.permitNumber.message}
								</p>
							) : null}
							<button
								type="submit"
								className="btn btn-primary"
								disabled={
									!permitNameDraft.trim() ||
									permitNameDraft.trim() ===
										selectedPermit.permitNumber ||
									isSubmitting
								}
							>
								Guardar
							</button>
							<button
								type="button"
								className="btn btn-ghost"
								onClick={onCancelRename}
								disabled={isSubmitting}
							>
								Cancelar
							</button>
						</fetcher.Form>
					) : (
						<div className="flex items-center justify-between gap-3">
							<p className="truncate text-xl font-semibold">
								{selectedPermit.permitNumber}
							</p>
							<button
								type="button"
								className="btn btn-ghost btn-sm"
								onClick={onBeginRename}
								disabled={isSubmitting}
							>
								Renombrar
							</button>
						</div>
					)}
					<p className="mt-1 text-sm text-base-content/60">
						{selectedPermit.communityName}
					</p>

					<div className="mt-5 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
						<label className="form-control">
							<span className="label-text mb-2 font-semibold">
								Encargado
							</span>
							<select
								className="select select-bordered w-full"
								value={selectedUserId}
								onChange={(event) =>
									onSelectedUserChange(event.target.value)
								}
								disabled={isSubmitting}
							>
								<option value="">
									Selecciona un encargado
								</option>
								{eligibleUsers.map((user) => (
									<option key={user.id} value={user.id}>
										{user.name}
									</option>
								))}
							</select>
						</label>
						<button
							type="button"
							className="btn btn-outline self-end"
							onClick={onAddUser}
							disabled={!selectedUserId || isSubmitting}
						>
							Añadir
						</button>
					</div>
					<input
						className="input input-bordered mt-2 w-full"
						type="search"
						value={userSearch}
						onChange={(event) =>
							onUserSearchChange(event.target.value)
						}
						placeholder="Filtrar encargados disponibles"
						disabled={isSubmitting}
					/>

					<div className="mt-2 flex flex-col gap-2">
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
							<p className="py-6 text-center text-sm text-base-content/55">
								Aún no hay encargados asignados.
							</p>
						)}
					</div>

					<fetcher.Form
						method="post"
						className="mt-4"
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
						<div className="flex gap-2">
							<button
								type="button"
								className="btn btn-ghost flex-1"
								onClick={onDiscardDraft}
								disabled={!hasDirtyDraft || isSubmitting}
							>
								Descartar
							</button>
							<button
								type="submit"
								className="btn btn-primary flex-1"
								disabled={
									!hasDirtyDraft ||
									editableUsers.length === 0 ||
									isSubmitting
								}
							>
								{isSubmitting
									? "Guardando..."
									: "Guardar asignaciones"}
							</button>
						</div>
					</fetcher.Form>
				</div>
			) : (
				<p className="py-12 text-center text-sm text-base-content/55">
					Selecciona un permiso para configurar sus encargados.
				</p>
			)}
		</article>
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
		<div className="flex flex-col gap-3 rounded-xl border border-base-300 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
			<span className="min-w-0 truncate text-sm">
				{user.userFullName}
			</span>
			<div className="flex flex-wrap items-center justify-end gap-1">
				<button
					type="button"
					className="btn btn-ghost btn-xs"
					onClick={() => onMove(user.userId, -1)}
					disabled={index === 0 || isSubmitting}
					aria-label={`Subir ${user.userFullName}`}
				>
					↑
				</button>
				<button
					type="button"
					className="btn btn-ghost btn-xs"
					onClick={() => onMove(user.userId, 1)}
					disabled={index === usersCount - 1 || isSubmitting}
					aria-label={`Bajar ${user.userFullName}`}
				>
					↓
				</button>
				<button
					type="button"
					className={`btn btn-xs ${user.active ? "btn-success" : "btn-ghost"}`}
					onClick={() => onSetPrincipal(user.userId)}
					disabled={user.active || isSubmitting}
				>
					Principal
				</button>
				<button
					type="button"
					className="btn btn-ghost btn-xs text-error"
					onClick={() => onRemove(user.userId)}
					disabled={isSubmitting}
				>
					Quitar
				</button>
			</div>
		</div>
	)
}
