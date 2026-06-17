import "express-session"

import type { AdminSessionUser } from "../modules/admin/admin.types"

declare module "express-session" {
	interface SessionData {
		adminUser?: AdminSessionUser
	}
}
