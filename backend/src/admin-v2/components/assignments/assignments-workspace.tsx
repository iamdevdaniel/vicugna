import { useEffect, useRef, useState } from "react"
import { useFetcher } from "react-router"
import type {
	AssignmentPermitCard,
	ManagedUserOption,
	PermitListItem,
	SelectOption,
} from "../../../modules/assignments/assignment.types"
import type { AssignmentActionData } from "../../routes/assignments"
import { useAssignmentEditor } from "../../state/use-assignment-editor"
import { AssignmentEditorPanel } from "./assignment-editor-panel"
import { AssignmentsListPanel } from "./assignments-list-panel"
import { PermitsPanel } from "./permits-panel"

type AssignmentsWorkspaceProps = {
	permits: PermitListItem[]
	communities: SelectOption[]
	users: ManagedUserOption[]
	assignmentCards: AssignmentPermitCard[]
	selectedSeasonId: string
}

export function AssignmentsWorkspace({
	permits,
	communities,
	users,
	assignmentCards,
	selectedSeasonId,
}: AssignmentsWorkspaceProps) {
	const mutation = useFetcher<AssignmentActionData>()
	const [successMessage, setSuccessMessage] = useState("")
	const mutationInFlight = useRef(false)
	const isSubmitting = mutation.state !== "idle"
	const editor = useAssignmentEditor({
		permits,
		users,
		assignmentCards,
		isMutationPending: isSubmitting,
	})
	const startMutation = () => {
		if (mutationInFlight.current || mutation.state !== "idle") {
			return false
		}

		mutationInFlight.current = true
		return true
	}

	useEffect(() => {
		if (mutation.state === "idle") {
			mutationInFlight.current = false
		}
	}, [mutation.state])

	useEffect(() => {
		if (mutation.state !== "idle" || !mutation.data?.ok) return

		setSuccessMessage(mutation.data.message)
		if (mutation.data.intent === "create-permit") {
			editor.createdPermit(mutation.data.permitId)
		}
		if (mutation.data.intent === "rename-permit") {
			editor.savedRename()
		}
		if (mutation.data.intent === "save-assignments") {
			editor.savedAssignments()
		}
		mutation.reset()
	}, [
		mutation.data,
		mutation.reset,
		mutation.state,
		editor.createdPermit,
		editor.savedAssignments,
		editor.savedRename,
	])

	useEffect(() => {
		if (!successMessage) return
		const timeout = window.setTimeout(() => setSuccessMessage(""), 4000)
		return () => window.clearTimeout(timeout)
	}, [successMessage])

	return (
		<>
			{mutation.data?.ok === false ? (
				<div className="alert alert-error alert-soft mt-4" role="alert">
					{mutation.data.message}
				</div>
			) : null}

			<section className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
				<PermitsPanel
					fetcher={mutation}
					selectedSeasonId={selectedSeasonId}
					communities={communities}
					permits={permits}
					selectedCommunityId={editor.selectedCommunityId}
					selectedPermitId={editor.selectedPermitId}
					permitSearch={editor.permitSearch}
					newPermitNumber={editor.newPermitNumber}
					visiblePermits={editor.visiblePermits}
					hasConflictingChanges={
						editor.hasDirtyDraft || editor.hasDirtyRename
					}
					isSubmitting={isSubmitting}
					onMutationStart={startMutation}
					assignedUsersCount={(permitId) =>
						editor.permitCards.get(permitId)?.users.length ?? 0
					}
					onSelectCommunity={editor.selectCommunity}
					onSelectPermit={editor.selectPermit}
					onPermitSearchChange={(value) =>
						editor.setText("permitSearch", value)
					}
					onNewPermitNumberChange={(value) =>
						editor.setText("newPermitNumber", value)
					}
				/>

				<AssignmentEditorPanel
					fetcher={mutation}
					selectedSeasonId={selectedSeasonId}
					selectedPermit={editor.selectedPermit}
					editableUsers={editor.editableUsers}
					eligibleUsers={editor.eligibleUsers}
					selectedUserId={editor.selectedUserId}
					userSearch={editor.userSearch}
					isRenaming={editor.isRenaming}
					permitNameDraft={editor.permitNameDraft}
					hasDirtyDraft={editor.hasDirtyDraft}
					isSubmitting={isSubmitting}
					onMutationStart={startMutation}
					onBeginRename={editor.beginRename}
					onCancelRename={editor.cancelRename}
					onPermitNameChange={(value) =>
						editor.setText("permitNameDraft", value)
					}
					onSelectedUserChange={(value) =>
						editor.setText("selectedUserId", value)
					}
					onUserSearchChange={(value) => {
						editor.setText("userSearch", value)
						editor.setText("selectedUserId", "")
					}}
					onAddUser={editor.addSelectedUser}
					onRemoveUser={editor.removeUser}
					onSetPrincipal={editor.setPrincipalUser}
					onMoveUser={editor.moveUser}
					onDiscardDraft={editor.discardDraft}
				/>

				<AssignmentsListPanel
					selectedCommunityId={editor.selectedCommunityId}
					selectedPermitId={editor.selectedPermitId}
					assignmentSearch={editor.assignmentSearch}
					assignmentCards={editor.visibleAssignmentCards}
					isSubmitting={isSubmitting}
					onSearchChange={(value) =>
						editor.setText("assignmentSearch", value)
					}
					onSelectPermit={editor.selectPermit}
				/>
			</section>

			{successMessage ? (
				<div className="toast toast-end z-50">
					<div className="alert alert-success" role="status">
						<span>{successMessage}</span>
						<button
							type="button"
							className="btn btn-ghost btn-xs"
							onClick={() => setSuccessMessage("")}
						>
							Cerrar
						</button>
					</div>
				</div>
			) : null}
		</>
	)
}
