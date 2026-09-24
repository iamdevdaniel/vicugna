import type {
	AssignmentPermitCard,
	ManagedUserOption,
	PermitListItem,
	SelectOption,
} from "../../../modules/assignments/assignment.types"
import { AssignmentEditorPanel } from "./assignments-editor-panel"
import { AssignmentsListPanel } from "./assignments-list-panel"
import { useAssignmentsMutation } from "./assignments-mutation"
import { useAssignmentNavigationGuard } from "./assignments-navigation"
import { PermitsPanel } from "./assignments-permits-panel"
import { useAssignmentEditor } from "./assignments-state"

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
	const editor = useAssignmentEditor({
		permits,
		users,
		assignmentCards,
	})
	const mutation = useAssignmentsMutation({
		onPermitCreated: editor.createdPermit,
		onPermitRenamed: editor.savedRename,
		onAssignmentsSaved: editor.savedAssignments,
	})
	useAssignmentNavigationGuard({
		hasUnsavedChanges: editor.hasUnsavedChanges,
		isMutationPending: mutation.isSubmitting,
		onDiscard: editor.discardChanges,
	})

	return (
		<>
			{mutation.fetcher.data?.ok === false ? (
				<div className="alert alert-error alert-soft mt-4" role="alert">
					{mutation.fetcher.data.message}
				</div>
			) : null}

			<section className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
				<PermitsPanel
					fetcher={mutation.fetcher}
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
					isSubmitting={mutation.isSubmitting}
					onMutationStart={mutation.startMutation}
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
					fetcher={mutation.fetcher}
					selectedSeasonId={selectedSeasonId}
					selectedPermit={editor.selectedPermit}
					editableUsers={editor.editableUsers}
					eligibleUsers={editor.eligibleUsers}
					selectedUserId={editor.selectedUserId}
					userSearch={editor.userSearch}
					isRenaming={editor.isRenaming}
					permitNameDraft={editor.permitNameDraft}
					hasDirtyDraft={editor.hasDirtyDraft}
					isSubmitting={mutation.isSubmitting}
					onMutationStart={mutation.startMutation}
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
					isSubmitting={mutation.isSubmitting}
					onSearchChange={(value) =>
						editor.setText("assignmentSearch", value)
					}
					onSelectPermit={editor.selectPermit}
				/>
			</section>

			{mutation.successMessage ? (
				<div className="toast toast-end z-50">
					<div className="alert alert-success" role="status">
						<span>{mutation.successMessage}</span>
						<button
							type="button"
							className="btn btn-ghost btn-xs"
							onClick={mutation.dismissSuccess}
						>
							Cerrar
						</button>
					</div>
				</div>
			) : null}
		</>
	)
}
