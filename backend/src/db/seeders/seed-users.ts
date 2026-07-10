import { pool } from "@config"
import { db } from "@db"
import bcrypt from "bcrypt"
import { users } from "../schema"

const DEFAULT_AVATAR_STYLE = "marble"

const TEST_USERS = [
	{
		id: "user-seed-01",
		fullName: "Test User 01",
		phoneNumber: "70000001",
		email: "test-user-01@vicugna.local",
		password: "test-user-pswd-01",
		avatarSeed: "vicugna-seed-user-01",
	},
	{
		id: "user-seed-02",
		fullName: "Test User 02",
		phoneNumber: "70000002",
		email: "test-user-02@vicugna.local",
		password: "test-user-pswd-02",
		avatarSeed: "vicugna-seed-user-02",
	},
	{
		id: "user-seed-03",
		fullName: "Test User 03",
		phoneNumber: "70000003",
		email: "test-user-03@vicugna.local",
		password: "test-user-pswd-03",
		avatarSeed: "vicugna-seed-user-03",
	},
	{
		id: "user-seed-04",
		fullName: "Test User 04",
		phoneNumber: "70000004",
		email: "test-user-04@vicugna.local",
		password: "test-user-pswd-04",
		avatarSeed: "vicugna-seed-user-04",
	},
	{
		id: "user-seed-05",
		fullName: "Test User 05",
		phoneNumber: "70000005",
		email: "test-user-05@vicugna.local",
		password: "test-user-pswd-05",
		avatarSeed: "vicugna-seed-user-05",
	},
] as const

async function seedUsers() {
	for (const user of TEST_USERS) {
		await db
			.insert(users)
			.values({
				id: user.id,
				fullName: user.fullName,
				phoneNumber: user.phoneNumber,
				email: user.email,
				passwordHash: await bcrypt.hash(user.password, 12),
				role: "user",
				isActive: true,
				avatarSeed: user.avatarSeed,
				avatarStyle: DEFAULT_AVATAR_STYLE,
			})
			.onConflictDoUpdate({
				target: users.phoneNumber,
				set: {
					fullName: user.fullName,
					email: user.email,
					passwordHash: await bcrypt.hash(user.password, 12),
					role: "user",
					isActive: true,
					avatarSeed: user.avatarSeed,
					avatarStyle: DEFAULT_AVATAR_STYLE,
					updatedAt: new Date(),
				},
			})
	}
}

seedUsers()
	.then(async () => {
		await pool.end()
		console.log("Users seeded")
	})
	.catch(async (error: unknown) => {
		await pool.end()
		console.error(error)
		process.exit(1)
	})
