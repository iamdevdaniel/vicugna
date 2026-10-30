import assert from "node:assert/strict"
import { afterEach, test } from "node:test"
import {
	finishDataOperation,
	tryStartDataOperation,
	useDataOperationGuard,
} from "./data-operation-guard"

afterEach(() => finishDataOperation())

test("allows only one data operation until the active operation finishes", () => {
	assert.equal(tryStartDataOperation("overview-only"), true)
	assert.equal(tryStartDataOperation("current-screen"), false)
	assert.equal(
		useDataOperationGuard.getState().navigationMode,
		"overview-only",
	)

	finishDataOperation()

	assert.equal(tryStartDataOperation("current-screen"), true)
	assert.equal(
		useDataOperationGuard.getState().navigationMode,
		"current-screen",
	)
})
