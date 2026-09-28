import { login as loginRequest } from "@api"
import type { MobileAuthUser } from "@definitions/types"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { closeWebFieldDatabase } from "../database/index.web"

type WebAuthState = {
	token: string | null
	expiresAt: string | null
	user: MobileAuthUser | null
	isAuthenticated: boolean
	error: string | null
	isHydrated: boolean
	isLoggingIn: boolean
	sessionRevision: number
	setHydrated: (value: boolean) => void
	login: (email: string, password: string) => Promise<boolean>
	logout: () => void
	clearError: () => void
}

export const useMobileAuthStore = create<WebAuthState>()(
	persist(
		(set, get) => ({
			token: null,
			expiresAt: null,
			user: null,
			isAuthenticated: false,
			error: null,
			isHydrated: false,
			isLoggingIn: false,
			sessionRevision: 0,
			setHydrated: (value) => set({ isHydrated: value }),
			login: async (email, password) => {
				set({ isLoggingIn: true, error: null })

				try {
					const payload = await loginRequest(email, password)
					assertValidLoginPayload(payload)
					set((state) => ({
						token: payload.token,
						expiresAt: payload.expiresAt,
						user: payload.user,
						isAuthenticated: true,
						isLoggingIn: false,
						sessionRevision: state.sessionRevision + 1,
					}))
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
			logout: () => {
				const accountId = get().user?.id
				set((state) => ({
					token: null,
					expiresAt: null,
					user: null,
					isAuthenticated: false,
					error: null,
					sessionRevision: state.sessionRevision + 1,
				}))
				if (accountId) closeWebFieldDatabase(accountId)
			},
			clearError: () => set({ error: null }),
		}),
		{
			name: "vicugna-web-auth",
			storage: createJSONStorage(() => localStorage),
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

export type WebSessionSnapshot = {
	accountId: string
	token: string
	revision: number
}

export function getWebSessionSnapshot(): WebSessionSnapshot | null {
	const state = useMobileAuthStore.getState()
	if (!state.isAuthenticated || !state.token || !state.user?.id) return null

	return {
		accountId: state.user.id,
		token: state.token,
		revision: state.sessionRevision,
	}
}

export function isWebSessionCurrent(session: WebSessionSnapshot): boolean {
	const state = useMobileAuthStore.getState()
	return (
		state.isAuthenticated &&
		state.user?.id === session.accountId &&
		state.token === session.token &&
		state.sessionRevision === session.revision
	)
}

function assertValidLoginPayload(payload: unknown): asserts payload is {
	token: string
	expiresAt: string
	user: MobileAuthUser
} {
	if (typeof payload !== "object" || payload === null) {
		throw new Error("El servidor devolvió una sesión inválida")
	}

	const session = payload as Partial<{
		token: unknown
		expiresAt: unknown
		user: Partial<MobileAuthUser>
	}>
	if (
		typeof session.token !== "string" ||
		session.token.trim() === "" ||
		typeof session.expiresAt !== "string" ||
		Number.isNaN(Date.parse(session.expiresAt)) ||
		typeof session.user?.id !== "string" ||
		session.user.id.trim() === "" ||
		typeof session.user.email !== "string" ||
		typeof session.user.fullName !== "string" ||
		session.user.role !== "user" ||
		typeof session.user.avatarSeed !== "string"
	) {
		throw new Error("El servidor devolvió una sesión inválida")
	}
}
