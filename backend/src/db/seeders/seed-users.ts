import { pool } from "@config"
import { db } from "@db"
import bcrypt from "bcrypt"
import { users } from "../schema"

const TEST_USERS = [
	{
		id: "user-seed-01",
		fullName: "Maria Quispe",
		phoneNumber: "70000001",
		email: "maria.quispe@gmail.com",
		password: "maria_pswd",
		avatarSeed: "vicugna-seed-user-01",
	},
	{
		id: "user-seed-02",
		fullName: "Juan Mamani",
		phoneNumber: "70000002",
		email: "juan.mamani@gmail.com",
		password: "juan_pswd",
		avatarSeed: "vicugna-seed-user-02",
	},
	{
		id: "user-seed-03",
		fullName: "Lucia Choque",
		phoneNumber: "70000003",
		email: "lucia.choque@gmail.com",
		password: "lucia_pswd",
		avatarSeed: "vicugna-seed-user-03",
	},
	{
		id: "user-seed-04",
		fullName: "Carlos Huanca",
		phoneNumber: "70000004",
		email: "carlos.huanca@gmail.com",
		password: "carlos_pswd",
		avatarSeed: "vicugna-seed-user-04",
	},
	{
		id: "user-seed-05",
		fullName: "Rosa Condori",
		phoneNumber: "70000005",
		email: "rosa.condori@gmail.com",
		password: "rosa_pswd",
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
