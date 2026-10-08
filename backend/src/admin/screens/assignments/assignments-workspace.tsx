import { Alert, Box, Button, Grid, Group, Text } from "@mantine/core"
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
		onAssignmentSaved: editor.savedAssignment,
	})
	useAssignmentNavigationGuard({
		hasUnsavedChanges: editor.hasUnsavedChanges,
		isMutationPending: mutation.isSubmitting,
		onDiscard: editor.discardChanges,
	})

	return (
		<>
			{mutation.fetcher.data?.ok === false ? (
				<Alert color="red" mt="md" role="alert">
					{mutation.fetcher.data.message}
				</Alert>
			) : null}

			<Grid component="section" mt="md" align="flex-start">
				<Grid.Col span={{ base: 12, lg: 4 }}>
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
						isAssigned={(permitId) =>
							editor.permitCards.has(permitId)
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
				</Grid.Col>

				<Grid.Col span={{ base: 12, lg: 4 }}>
					<AssignmentEditorPanel
						fetcher={mutation.fetcher}
						selectedSeasonId={selectedSeasonId}
						selectedPermit={editor.selectedPermit}
						users={editor.users}
						assignedUserId={editor.assignedUserId}
						canChangeAssignment={editor.canChangeAssignment}
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
						onAssignedUserChange={editor.setAssignmentDraft}
						onDiscardDraft={editor.discardAssignmentDraft}
					/>
				</Grid.Col>

				<Grid.Col span={{ base: 12, lg: 4 }}>
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
				</Grid.Col>
			</Grid>

			{mutation.successMessage ? (
				<Box
					pos="fixed"
					right={20}
					bottom={20}
					style={{ zIndex: 1000 }}
				>
					<Alert color="green" role="status">
						<Group gap="md" wrap="nowrap">
							<Text size="sm">{mutation.successMessage}</Text>
							<Button
								type="button"
								variant="subtle"
								size="compact-xs"
								onClick={mutation.dismissSuccess}
							>
								Cerrar
							</Button>
						</Group>
					</Alert>
				</Box>
			) : null}
		</>
	)
}
