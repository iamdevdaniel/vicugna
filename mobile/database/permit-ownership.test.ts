import assert from "node:assert/strict"
import test from "node:test"
import { assertPermitOwner } from "./permit-ownership"

test("accepts a permit owned by the current account", () => {
	assert.doesNotThrow(() => assertPermitOwner("user-a", "user-a"))
})

test("rejects a permit owned by another account", () => {
	assert.throws(
		() => assertPermitOwner("user-a", "user-b"),
		/El permiso no pertenece a la cuenta activa/,
	)
})
