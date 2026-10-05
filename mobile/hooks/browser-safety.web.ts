import { createContext, useContext } from "react"

export type BrowserPersistenceStatus =
	| "checking"
	| "granted"
	| "denied"
	| "unsupported"

type BrowserSafetyContextValue = {
	persistenceStatus: BrowserPersistenceStatus
	requestPersistence: () => Promise<BrowserPersistenceStatus>
}

export const BrowserSafetyContext = createContext<BrowserSafetyContextValue>({
	persistenceStatus: "checking",
	requestPersistence: async () => "unsupported",
})

export function useBrowserPersistenceStatus(): BrowserPersistenceStatus {
	return useContext(BrowserSafetyContext).persistenceStatus
}

export function useRequestBrowserPersistence(): () => Promise<BrowserPersistenceStatus> {
	return useContext(BrowserSafetyContext).requestPersistence
}
