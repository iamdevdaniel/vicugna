import type { Request } from "express"
import type { RouterContext } from "react-router" with {
	"resolution-mode": "import",
}

type AdminSession = Request["session"]

const contextKey = "__vicugnaAdminV2SessionContext" as const
const contextRegistry = globalThis as typeof globalThis & {
	[contextKey]?: RouterContext<AdminSession>
}

// Express and React Router are built separately but run in the same process.
// Keeping this key global gives both builds the same context identity.
export const adminSessionContext = contextRegistry[contextKey] ?? {}
contextRegistry[contextKey] = adminSessionContext
