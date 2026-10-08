import { useMemo, useState } from "react"
import { createStore, useStore } from "zustand"
import type {
	AssignmentPermitCard,
	ManagedUserOption,
	PermitListItem,
} from "../../../modules/assignments/assignment.types"

type EditorTextField =
	| "permitSearch"
	| "assignmentSearch"
	| "newPermitNumber"
	| "permitNameDraft"

type EditorState = {
	selectedCommunityId: string
	selectedPermitId: string
	permitSearch: string
	assignmentSearch: string
	newPermitNumber: string
	isRenaming: boolean
	permitNameDraft: string
	assignmentDraftUserId: string | undefined
}

type EditorStore = EditorState & {
	setText: (field: EditorTextField, value: string) => void
	selectCommunity: (communityId: string) => void
	selectPermit: (permitId: string) => void
	beginRename: (permitNumber: string) => void
	cancelRename: () => void
	setAssignmentDraft: (userId: string | undefined) => void
	createdPermit: (permitId: string) => void
	savedRename: () => void
	savedAssignment: () => void
	discardChanges: () => void
}

const initialState: EditorState = {
	selectedCommunityId: "",
	selectedPermitId: "",
	permitSearch: "",
	assignmentSearch: "",
	newPermitNumber: "",
	isRenaming: false,
	permitNameDraft: "",
	assignmentDraftUserId: undefined,
}

const clearedDrafts = {
	newPermitNumber: "",
	isRenaming: false,
	permitNameDraft: "",
	assignmentDraftUserId: undefined,
} satisfies Partial<EditorState>

function createAssignmentEditorStore() {
	return createStore<EditorStore>((set) => ({
		...initialState,
		setText: (field, value) =>
			set({ [field]: value } as Partial<EditorState>),
		selectCommunity: (communityId) =>
			set({
				...clearedDrafts,
				selectedCommunityId: communityId,
				selectedPermitId: "",
				permitSearch: "",
				assignmentSearch: "",
			}),
		selectPermit: (permitId) =>
			set((state) => ({
				...clearedDrafts,
				selectedPermitId:
					state.selectedPermitId === permitId ? "" : permitId,
			})),
		beginRename: (permitNumber) =>
			set({ isRenaming: true, permitNameDraft: permitNumber }),
		cancelRename: () => set({ isRenaming: false, permitNameDraft: "" }),
		setAssignmentDraft: (assignmentDraftUserId) =>
			set({ assignmentDraftUserId }),
		createdPermit: (permitId) =>
			set({
				...clearedDrafts,
				selectedPermitId: permitId,
			}),
		savedRename: () => set({ isRenaming: false, permitNameDraft: "" }),
		savedAssignment: () => set({ assignmentDraftUserId: undefined }),
		discardChanges: () => set(clearedDrafts),
	}))
}

type UseAssignmentEditorOptions = {
	permits: PermitListItem[]
	users: ManagedUserOption[]
	assignmentCards: AssignmentPermitCard[]
}

export function useAssignmentEditor({
	permits,
	users,
	assignmentCards,
}: UseAssignmentEditorOptions) {
	const [store] = useState(createAssignmentEditorStore)
	const editor = useStore(store)
	const {
		assignmentDraftUserId,
		selectCommunity: selectCommunityState,
		selectPermit: selectPermitState,
		beginRename: beginRenameState,
		discardChanges,
		...exposedEditor
	} = editor
	const permitCards = useMemo(
		() => new Map(assignmentCards.map((card) => [card.permitId, card])),
		[assignmentCards],
	)
	const selectedPermit = permits.find(
		(permit) => permit.id === editor.selectedPermitId,
	)
	const selectedAssignment = selectedPermit
		? permitCards.get(selectedPermit.id)
		: undefined
	const savedUserId = selectedAssignment?.user.userId ?? ""
	const assignedUserId = assignmentDraftUserId ?? savedUserId
	const hasDirtyDraft =
		assignmentDraftUserId !== undefined &&
		assignmentDraftUserId !== savedUserId
	const hasNewPermitDraft = Boolean(editor.newPermitNumber.trim())
	const hasDirtyRename =
		editor.isRenaming &&
		selectedPermit !== undefined &&
		editor.permitNameDraft.trim() !== selectedPermit.permitNumber
	const hasUnsavedChanges =
		hasDirtyDraft || hasNewPermitDraft || hasDirtyRename

	function discardChangesIfNeeded() {
		return (
			!hasUnsavedChanges ||
			window.confirm("Hay cambios sin guardar. ¿Quieres descartarlos?")
		)
	}

	function selectCommunity(communityId: string) {
		if (!discardChangesIfNeeded()) return
		selectCommunityState(communityId)
	}

	function selectPermit(permitId: string) {
		if (!discardChangesIfNeeded()) return
		selectPermitState(permitId)
	}

	return {
		...exposedEditor,
		selectedPermit,
		permitCards,
		assignedUserId,
		canChangeAssignment:
			selectedPermit?.syncStatus === "created" ||
			selectedPermit?.syncStatus === "assigned",
		hasDirtyDraft,
		hasDirtyRename,
		hasUnsavedChanges,
		visiblePermits: permits.filter(
			(permit) =>
				permit.communityId === editor.selectedCommunityId &&
				includesSearch(permit.permitNumber, editor.permitSearch),
		),
		visibleAssignmentCards: assignmentCards.filter(
			(card) =>
				card.communityId === editor.selectedCommunityId &&
				includesSearch(
					`${card.permitNumber} ${card.user.userFullName}`,
					editor.assignmentSearch,
				),
		),
		selectCommunity,
		selectPermit,
		beginRename: () => {
			if (!selectedPermit) return
			beginRenameState(selectedPermit.permitNumber)
		},
		discardAssignmentDraft: () => editor.setAssignmentDraft(undefined),
		discardChanges,
		users,
	}
}

function includesSearch(value: string, search: string) {
	return value
		.toLocaleLowerCase("es")
		.includes(search.trim().toLocaleLowerCase("es"))
}
