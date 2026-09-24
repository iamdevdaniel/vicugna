import { useEffect, useRef, useState } from "react"
import { useFetcher, useLocation } from "react-router"
import type { UserListItem } from "../../../modules/users/user.types"
import type { UsersActionData } from "./users-types"

type UseUsersStateOptions = {
	users: UserListItem[]
	suggestedPassword: string
}

export function useUsersState({
	users,
	suggestedPassword,
}: UseUsersStateOptions) {
	const location = useLocation()
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [successMessage, setSuccessMessage] = useState("")
	const [password, setPassword] = useState(suggestedPassword)
	const formRef = useRef<HTMLFormElement>(null)
	const firstFieldRef = useRef<HTMLInputElement>(null)
	const createUser = useFetcher<UsersActionData>()
	const passwordSuggestion = useFetcher<{ password: string }>()
	const isSubmitting = createUser.state !== "idle"

	useEffect(() => {
		if (!isModalOpen) return
		firstFieldRef.current?.focus()
	}, [isModalOpen])

	useEffect(() => {
		if (!passwordSuggestion.data?.password) return
		setPassword(passwordSuggestion.data.password)
	}, [passwordSuggestion.data])

	useEffect(() => {
		if (!createUser.data?.ok) return
		setSuccessMessage(createUser.data.successMessage)
		setIsModalOpen(false)
		formRef.current?.reset()
		createUser.reset()
	}, [createUser.data, createUser.reset])

	useEffect(() => {
		if (!successMessage) return
		const timeout = window.setTimeout(() => setSuccessMessage(""), 4000)
		return () => window.clearTimeout(timeout)
	}, [successMessage])

	useEffect(() => {
		if (!isModalOpen || isSubmitting) return
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return
			createUser.reset()
			passwordSuggestion.reset()
			setIsModalOpen(false)
		}
		window.addEventListener("keydown", closeOnEscape)
		return () => window.removeEventListener("keydown", closeOnEscape)
	}, [isModalOpen, isSubmitting, createUser.reset, passwordSuggestion.reset])

	function openModal() {
		createUser.reset()
		passwordSuggestion.reset()
		setPassword(suggestedPassword)
		setIsModalOpen(true)
	}

	function closeModal() {
		if (isSubmitting) return
		createUser.reset()
		passwordSuggestion.reset()
		setIsModalOpen(false)
	}

	return {
		activeTab:
			location.hash === "#admins"
				? ("admins" as const)
				: ("users" as const),
		regularUsers: users.filter((user) => user.role === "user"),
		adminUsers: users.filter((user) => user.role === "admin"),
		isModalOpen,
		successMessage,
		password,
		formRef,
		firstFieldRef,
		createUser,
		passwordSuggestion,
		isSubmitting,
		openModal,
		closeModal,
		setPassword,
		dismissSuccess: () => setSuccessMessage(""),
		requestPasswordSuggestion: () =>
			passwordSuggestion.load("/users/password-suggestion"),
	}
}

export type UsersState = ReturnType<typeof useUsersState>
