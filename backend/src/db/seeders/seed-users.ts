import { pool } from "@config"
import { db } from "@db"
import bcrypt from "bcrypt"
import { users } from "../schema"

const TEST_USERS = [
	{
		id: "user-seed-01",
		firstName: "María",
		paternalLastName: "Quispe",
		maternalLastName: "Flores",
		phoneNumber: "70000001",
		email: "maria.quispe@gmail.com",
		password: "maria_pswd",
		avatarSeed: "vicugna-seed-user-01",
	},
	{
		id: "user-seed-02",
		firstName: "Juan",
		paternalLastName: "Mamani",
		maternalLastName: "Choque",
		phoneNumber: "70000002",
		email: "juan.mamani@gmail.com",
		password: "juan_pswd",
		avatarSeed: "vicugna-seed-user-02",
	},
	{
		id: "user-seed-03",
		firstName: "Lucía",
		paternalLastName: "Choque",
		maternalLastName: "Condori",
		phoneNumber: "70000003",
		email: "lucia.choque@gmail.com",
		password: "lucia_pswd",
		avatarSeed: "vicugna-seed-user-03",
	},
	{
		id: "user-seed-04",
		firstName: "Carlos",
		paternalLastName: "Huanca",
		maternalLastName: "Quispe",
		phoneNumber: "70000004",
		email: "carlos.huanca@gmail.com",
		password: "carlos_pswd",
		avatarSeed: "vicugna-seed-user-04",
	},
	{
		id: "user-seed-05",
		firstName: "Rosa",
		paternalLastName: "Condori",
		maternalLastName: "Mamani",
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
				firstName: user.firstName,
				paternalLastName: user.paternalLastName,
				maternalLastName: user.maternalLastName,
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
					firstName: user.firstName,
					paternalLastName: user.paternalLastName,
					maternalLastName: user.maternalLastName,
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
		console.log("🪴 Users seeded")
	})
	.catch(async (error: unknown) => {
		await pool.end()
		console.error(error)
		process.exit(1)
	})
