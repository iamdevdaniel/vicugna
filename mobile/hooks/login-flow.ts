import { useMobileAuthStore } from "@utils/auth-store"
import { useCallback } from "react"

export function useLoginFlow() {
	const {
		token,
		user,
		error,
		isHydrated,
		isLoggingIn,
		login,
		clearError,
	} = useMobileAuthStore()

	const submitLogin = useCallback(
		async (email: string, password: string) => {
			return login(email, password)
		},
		[login],
	)

	return {
		token,
		user,
		error,
		isHydrated,
		isLoggingIn,
		submitLogin,
		clearError,
	}
}
