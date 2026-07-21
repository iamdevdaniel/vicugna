import { useMobileAuthStore } from "@utils/auth-store"
import { useCallback } from "react"

export function useMobileLogin() {
	const {
		token,
		user,
		error,
		isHydrated,
		isLoggingIn,
		login,
		clearError,
	} = useMobileAuthStore()
	const isAuthenticated = Boolean(token && user)

	const submitLogin = useCallback(
		async (email: string, password: string) => {
			return login(email, password)
		},
		[login],
	)

	return {
		error,
		isHydrated,
		isAuthenticated,
		isLoggingIn,
		submitLogin,
		clearError,
	}
}
