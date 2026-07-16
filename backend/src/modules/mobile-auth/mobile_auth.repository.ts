import { db } from "@db"
import { eq } from "drizzle-orm"

import { users } from "../../db/schema"

export async function findMobileUserByEmail(email: string) {
	return db.query.users.findFirst({
		where: eq(users.email, email),
	})
}
