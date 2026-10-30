import assert from "node:assert/strict"
import test from "node:test"
import {
	getPendingSyncRequestErrorMessage,
	isUncertainSyncRequestErrorCode,
	mobilePermitSyncErrors,
	mobileRequestErrors,
} from "./errors"

test("1. timeout keeps the send pending", () => {
	assert.equal(
		isUncertainSyncRequestErrorCode(mobileRequestErrors.timeout.code),
		true,
	)
})

test("2. unreachable backend keeps the send pending", () => {
	assert.equal(
		isUncertainSyncRequestErrorCode(mobileRequestErrors.unreachable.code),
		true,
	)
})

test("3. invalid response keeps the send pending", () => {
	assert.equal(
		isUncertainSyncRequestErrorCode(
			mobileRequestErrors.invalidResponse.code,
		),
		true,
	)
})

test("4. server error keeps the send pending", () => {
	assert.equal(
		isUncertainSyncRequestErrorCode(mobileRequestErrors.serverError.code),
		true,
	)
})

test("5. unexpected error keeps the send pending", () => {
	assert.equal(
		isUncertainSyncRequestErrorCode(mobileRequestErrors.unexpected.code),
		true,
	)
})

test("6. confirmed offline state does not keep the send pending", () => {
	assert.equal(
		isUncertainSyncRequestErrorCode(mobileRequestErrors.offline.code),
		false,
	)
})

test("7. each pending request failure uses its retry message", () => {
	assert.match(
		getPendingSyncRequestErrorMessage(
			mobileRequestErrors.timeout.code,
			"fallback",
		),
		/Reintentar envío/,
	)
	assert.match(
		getPendingSyncRequestErrorMessage(
			mobileRequestErrors.unreachable.code,
			"fallback",
		),
		/No hay conexión/,
	)
	assert.match(
		getPendingSyncRequestErrorMessage(
			mobileRequestErrors.serverError.code,
			"fallback",
		),
		/servidor tuvo un problema/,
	)
	assert.equal(
		getPendingSyncRequestErrorMessage(
			mobileRequestErrors.invalidResponse.code,
			"fallback",
		),
		mobilePermitSyncErrors.resultUnknown.message,
	)
	assert.equal(
		getPendingSyncRequestErrorMessage(
			mobileRequestErrors.unexpected.code,
			"fallback",
		),
		mobilePermitSyncErrors.resultUnknown.message,
	)
})
