import { useEffect, useMemo, useState } from "react"
import { useBlocker } from "react-router"
import { createStore, useStore } from "zustand"
import type {
	AssignmentPermitCard,
	ManagedUserOption,
	PermitListItem,
} from "../../modules/assignments/assignment.types"

export type EditableAssignmentUser = {
	userId: string
	userFullName: string
	active: boolean
}

type EditorTextField =
	| "permitSearch"
	| "assignmentSearch"
	| "newPermitNumber"
	| "permitNameDraft"
	| "userSearch"
	| "selectedUserId"

type EditorState = {
	selectedCommunityId: string
	selectedPermitId: string
	permitSearch: string
	assignmentSearch: string
	newPermitNumber: string
	isRenaming: boolean
	permitNameDraft: string
	draftUsers: EditableAssignmentUser[] | null
	userSearch: string
	selectedUserId: string
}

type EditorStore = EditorState & {
	setText: (field: EditorTextField, value: string) => void
	selectCommunity: (communityId: string) => void
	selectPermit: (permitId: string) => void
	beginRename: (permitNumber: string) => void
	cancelRename: () => void
	setDraft: (users: EditableAssignmentUser[] | null) => void
	createdPermit: (permitId: string) => void
	savedRename: () => void
	savedAssignments: () => void
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
	draftUsers: null,
	userSearch: "",
	selectedUserId: "",
}

const clearedDrafts = {
	newPermitNumber: "",
	isRenaming: false,
	permitNameDraft: "",
	draftUsers: null,
	userSearch: "",
	selectedUserId: "",
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
		setDraft: (draftUsers) => set({ draftUsers }),
		createdPermit: (permitId) =>
			set({
				...clearedDrafts,
				selectedPermitId: permitId,
			}),
		savedRename: () => set({ isRenaming: false, permitNameDraft: "" }),
		savedAssignments: () =>
			set({ draftUsers: null, userSearch: "", selectedUserId: "" }),
		discardChanges: () => set(clearedDrafts),
	}))
}

type UseAssignmentEditorOptions = {
	permits: PermitListItem[]
	users: ManagedUserOption[]
	assignmentCards: AssignmentPermitCard[]
	isMutationPending: boolean
}

export function useAssignmentEditor({
	permits,
	users,
	assignmentCards,
	isMutationPending,
}: UseAssignmentEditorOptions) {
	const [store] = useState(createAssignmentEditorStore)
	const editor = useStore(store)
	const {
		draftUsers,
		selectCommunity: selectCommunityState,
		selectPermit: selectPermitState,
		beginRename: beginRenameState,
		setDraft,
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
	const savedUsers: EditableAssignmentUser[] =
		selectedAssignment?.users.map((user) => ({
			userId: user.userId,
			userFullName: user.userFullName,
			active: user.active,
		})) ?? []
	const editableUsers = draftUsers ?? savedUsers
	const hasDirtyDraft =
		draftUsers !== null && !sameAssignments(draftUsers, savedUsers)
	const hasNewPermitDraft = Boolean(editor.newPermitNumber.trim())
	const hasDirtyRename =
		editor.isRenaming &&
		selectedPermit !== undefined &&
		editor.permitNameDraft.trim() !== selectedPermit.permitNumber
	const shouldWarnBeforeLeaving =
		hasDirtyDraft ||
		hasNewPermitDraft ||
		hasDirtyRename ||
		isMutationPending
	const blocker = useBlocker(shouldWarnBeforeLeaving)

	useEffect(() => {
		if (blocker.state !== "blocked") return

		if (window.confirm(getLeaveWarning(isMutationPending))) {
			discardChanges()
			blocker.proceed()
			return
		}

		blocker.reset()
	}, [blocker, isMutationPending, discardChanges])

	useEffect(() => {
		if (!shouldWarnBeforeLeaving) return

		const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
			event.preventDefault()
			event.returnValue = ""
		}
		window.addEventListener("beforeunload", warnBeforeLeaving)
		return () =>
			window.removeEventListener("beforeunload", warnBeforeLeaving)
	}, [shouldWarnBeforeLeaving])

	function discardChangesIfNeeded() {
		return (
			!shouldWarnBeforeLeaving ||
			window.confirm(getLeaveWarning(isMutationPending))
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

	function addSelectedUser() {
		const user = users.find(
			(candidate) => candidate.id === editor.selectedUserId,
		)
		if (!user) return

		setDraft([
			...editableUsers,
			{
				userId: user.id,
				userFullName: user.name,
				active: editableUsers.length === 0,
			},
		])
		editor.setText("selectedUserId", "")
		editor.setText("userSearch", "")
	}

	function removeUser(userId: string) {
		const removedUser = editableUsers.find((user) => user.userId === userId)
		const remainingUsers = editableUsers.filter(
			(user) => user.userId !== userId,
		)

		if (removedUser?.active && remainingUsers.length > 0) {
			remainingUsers[0] = { ...remainingUsers[0], active: true }
		}
		setDraft(remainingUsers)
	}

	function setPrincipalUser(userId: string) {
		setDraft(
			editableUsers.map((user) => ({
				...user,
				active: user.userId === userId,
			})),
		)
	}

	function moveUser(userId: string, offset: -1 | 1) {
		const currentIndex = editableUsers.findIndex(
			(user) => user.userId === userId,
		)
		const targetIndex = currentIndex + offset
		if (
			currentIndex < 0 ||
			targetIndex < 0 ||
			targetIndex >= editableUsers.length
		) {
			return
		}

		const reorderedUsers = [...editableUsers]
		const movedUser = reorderedUsers[currentIndex]
		reorderedUsers[currentIndex] = reorderedUsers[targetIndex]
		reorderedUsers[targetIndex] = movedUser
		setDraft(reorderedUsers)
	}

	return {
		...exposedEditor,
		selectedPermit,
		permitCards,
		editableUsers,
		hasDirtyDraft,
		hasDirtyRename,
		eligibleUsers: users.filter(
			(user) =>
				!editableUsers.some(
					(assignedUser) => assignedUser.userId === user.id,
				) && includesSearch(user.name, editor.userSearch),
		),
		visiblePermits: permits.filter(
			(permit) =>
				permit.communityId === editor.selectedCommunityId &&
				includesSearch(permit.permitNumber, editor.permitSearch),
		),
		visibleAssignmentCards: assignmentCards.filter(
			(card) =>
				card.communityId === editor.selectedCommunityId &&
				includesSearch(
					[
						card.permitNumber,
						...card.users.map((user) => user.userFullName),
					].join(" "),
					editor.assignmentSearch,
				),
		),
		selectCommunity,
		selectPermit,
		beginRename: () => {
			if (!selectedPermit) return
			beginRenameState(selectedPermit.permitNumber)
		},
		addSelectedUser,
		removeUser,
		setPrincipalUser,
		moveUser,
		discardDraft: () => setDraft(null),
	}
}

function getLeaveWarning(isMutationPending: boolean) {
	return isMutationPending
		? "Hay una operación en curso. Si sales, puede completarse sin mostrar el resultado. ¿Quieres salir?"
		: "Hay cambios sin guardar. ¿Quieres descartarlos?"
}

function sameAssignments(
	left: EditableAssignmentUser[],
	right: EditableAssignmentUser[],
) {
	return (
		left.length === right.length &&
		left.every(
			(user, index) =>
				user.userId === right[index]?.userId &&
				user.active === right[index]?.active,
		)
	)
}

function includesSearch(value: string, search: string) {
	return value
		.toLocaleLowerCase("es")
		.includes(search.trim().toLocaleLowerCase("es"))
}
