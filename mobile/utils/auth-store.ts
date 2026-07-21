import { login as loginRequest } from "@api"
import type { MobileAuthUser } from "@definitions/types"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

type MobileAuthState = {
	token: string | null
	expiresAt: string | null
	user: MobileAuthUser | null
	isAuthenticated: boolean
	error: string | null
	isHydrated: boolean
	isLoggingIn: boolean
	setHydrated: (value: boolean) => void
	login: (email: string, password: string) => Promise<boolean>
	logout: () => void
	clearError: () => void
}

export const useMobileAuthStore = create<MobileAuthState>()(
	persist(
		(set) => ({
			token: null,
			expiresAt: null,
			user: null,
			isAuthenticated: false,
			error: null,
			isHydrated: false,
			isLoggingIn: false,
			setHydrated: (value) => set({ isHydrated: value }),
			login: async (email, password) => {
				set({ isLoggingIn: true, error: null })

				try {
					const payload = await loginRequest(email, password)

					set({
						token: payload.token,
						expiresAt: payload.expiresAt,
						user: payload.user,
						isAuthenticated: true,
						error: null,
						isLoggingIn: false,
					})
					return true
				} catch (error) {
					set({
						error:
							error instanceof Error
								? error.message
								: "No se pudo conectar con el servidor",
						isLoggingIn: false,
					})
					return false
				}
			},
			logout: () =>
				set({
					token: null,
					expiresAt: null,
					user: null,
					isAuthenticated: false,
					error: null,
				}),
			clearError: () => set({ error: null }),
		}),
		{
			name: "vicugna-mobile-auth",
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state) => ({
				token: state.token,
				expiresAt: state.expiresAt,
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
			onRehydrateStorage: () => (state) => {
				state?.clearError()
				state?.setHydrated(true)
			},
		},
	),
)
