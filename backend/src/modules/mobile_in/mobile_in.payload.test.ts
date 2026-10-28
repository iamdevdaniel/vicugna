import assert from "node:assert/strict"
import { describe, it } from "node:test"
import type { PermitFieldData, SyncFieldData } from "@shared"
import { PERMIT_DATA_HASH_VERSION } from "../permit-sync/permit-data-hash"
import {
	PermitValidationError,
	permitValidationErrors,
} from "./mobile_in.errors"
import { parseSyncPayload } from "./mobile_in.payload"

const { makeCompletePermitData, permitId } =
	require("../../../../shared/permit-data-validation.fixture.js") as {
		makeCompletePermitData: () => PermitFieldData
		permitId: string
	}

describe("mobile sync payload metadata", () => {
	it("accepts a complete sync payload", () => {
		const payload = makeValidPayload()

		assert.deepEqual(parseSyncPayload(payload), payload)
	})

	it("rejects a missing permit ID", () => {
		const payload: Record<string, unknown> = makeValidPayload()
		delete payload.permitId

		assertInvalidPayload(payload)
	})

	it("rejects a missing base hash", () => {
		const payload: Record<string, unknown> = makeValidPayload()
		delete payload.baseHash

		assertInvalidPayload(payload)
	})

	it("rejects a malformed base hash", () => {
		const payload = { ...makeValidPayload(), baseHash: "not-a-hash" }

		assertInvalidPayload(payload)
	})

	it("rejects a missing hash version", () => {
		const payload: Record<string, unknown> = makeValidPayload()
		delete payload.hashVersion

		assertInvalidPayload(payload)
	})

	it("rejects a hash version with the wrong type", () => {
		const payload = { ...makeValidPayload(), hashVersion: "1" }

		assertInvalidPayload(payload)
	})

	it("rejects an unexpected top-level field", () => {
		const payload = { ...makeValidPayload(), extra: true }

		assertInvalidPayload(payload)
	})
})

function assertInvalidPayload(payload: unknown) {
	assert.throws(
		() => parseSyncPayload(payload),
		(error) =>
			error instanceof PermitValidationError &&
			error.code === permitValidationErrors.invalidPayload.code,
	)
}

function makeValidPayload(): SyncFieldData {
	return {
		permitId,
		baseHash: "0".repeat(64),
		hashVersion: PERMIT_DATA_HASH_VERSION,
		...makeCompletePermitData(),
	}
}
