const { by, device, element, expect: detoxExpect, waitFor } = require("detox")

const HAPPY_PERMIT = "TEST-01"
const VALIDATION_PERMIT = "TEST-02"

const DEFAULT_TIMEOUT = 15_000
const EXPO_SERVER_URL =
	process.env.E2E_EXPO_URL?.trim() || "http://127.0.0.1:8081"
const REACT_NATIVE_PRESSABLE_TYPE =
	"com.facebook.react.views.view.ReactViewGroup"

function requiredEnvironment(name) {
	const value = process.env[name]?.trim()
	if (!value) throw new Error(`Missing ${name} in mobile/.env`)
	return value
}

function escapedRegex(value) {
	return value.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function labelMatcher(label) {
	return by.label(new RegExp(`^${escapedRegex(label)}(?:, .*)?$`))
}

function pressableLabelMatcher(label) {
	return labelMatcher(label).and(by.type(REACT_NATIVE_PRESSABLE_TYPE))
}

async function findVisible(
	matcher,
	{ scroll = true, timeout = DEFAULT_TIMEOUT } = {},
) {
	const target = element(matcher)

	try {
		await detoxExpect(target).toBeVisible()
		return target
	} catch {
		if (!scroll) {
			await waitFor(target).toBeVisible().withTimeout(timeout)
			return target
		}

		const scrollTypes = [
			"android.widget.ScrollView",
			"androidx.recyclerview.widget.RecyclerView",
		]
		for (const type of scrollTypes) {
			for (const direction of ["down", "up"]) {
				try {
					await waitFor(target)
						.toBeVisible()
						.whileElement(by.type(type))
						.scroll(300, direction)
					return target
				} catch {}
			}
		}

		await waitFor(target).toBeVisible().withTimeout(timeout)
		return target
	}
}

async function byLabel(label, options) {
	return findVisible(labelMatcher(label), options)
}

async function byPressableLabel(label, options) {
	return findVisible(pressableLabelMatcher(label), options)
}

async function byLabelContaining(value, options) {
	return findVisible(
		by.label(new RegExp(`.*${escapedRegex(value)}.*`, "s")),
		options,
	)
}

async function byText(value, options) {
	return findVisible(by.text(value), options)
}

async function tapLabel(label, options) {
	await (await byPressableLabel(label, options)).tap()
}

async function tapLabelContaining(value, options) {
	await (await byLabelContaining(value, options)).tap()
}

async function tapText(value, options) {
	await (await byText(value, options)).tap()
}

async function replaceField(label, value) {
	const field = await byLabel(label)
	await field.replaceText(String(value))
	return field
}

async function expectText(value) {
	await byText(value)
}

function readAttributeValue(attributes, label) {
	if (typeof attributes.text === "string" && attributes.text) {
		return attributes.text
	}
	if (typeof attributes.value === "string") return attributes.value
	if (attributes.label?.startsWith(`${label}, `)) {
		return attributes.label.slice(label.length + 2)
	}
	return ""
}

async function getFieldValue(label) {
	const field = await byLabel(label)
	return readAttributeValue(await field.getAttributes(), label)
}

async function waitUntil(check, message, timeout = DEFAULT_TIMEOUT) {
	const deadline = Date.now() + timeout
	while (Date.now() < deadline) {
		if (await check()) return
		await new Promise((resolve) => setTimeout(resolve, 100))
	}
	throw new Error(typeof message === "function" ? message() : message)
}

async function waitForFieldValueChange(label, previousValue) {
	let value = previousValue
	await waitUntil(async () => {
		value = await getFieldValue(label)
		return value !== previousValue
	}, `${label} did not change from ${previousValue}`)
	return value
}

async function expectFieldValue(label, value) {
	const expected = String(value)
	let actual = ""
	await waitUntil(
		async () => {
			actual = await getFieldValue(label)
			return actual === expected
		},
		() => `${label} should contain ${expected}, found ${actual}`,
	)
}

async function expectEnabled(label, enabled) {
	const target = await byPressableLabel(label)
	await waitUntil(
		async () => (await target.getAttributes()).enabled === enabled,
		`${label} should be ${enabled ? "enabled" : "disabled"}`,
	)
}

async function expectChecked(label, checked) {
	const target = await byLabel(label)
	const expected = checked ? "Seleccionado" : "No seleccionado"
	await waitUntil(
		async () =>
			(await target.getAttributes()).label?.endsWith(`, ${expected}`),
		`${label} should be ${expected.toLowerCase()}`,
	)
}

async function drawSignature() {
	const signature = await byLabel("Firma sin registrar")
	await signature.swipe("right", "slow", 0.55, 0.2, 0.65)
}

function displayTime(hour, minute) {
	const period = hour >= 12 ? "PM" : "AM"
	const displayHour = hour % 12 || 12
	return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`
}

async function replaceClockInputs(hour, minute) {
	const inputType = "android.widget.EditText"
	const attributes = await element(by.type(inputType)).getAttributes()
	const matchCount = attributes.elements?.length ?? 1

	if (matchCount < 2) {
		throw new Error(
			"The time picker did not expose its hour and minute inputs",
		)
	}

	const hourInput = element(by.type(inputType)).atIndex(matchCount - 2)
	const minuteInput = element(by.type(inputType)).atIndex(matchCount - 1)
	await waitFor(hourInput).toBeVisible().withTimeout(DEFAULT_TIMEOUT)
	await waitFor(minuteInput).toBeVisible().withTimeout(DEFAULT_TIMEOUT)
	await hourInput.replaceText(String(hour))
	await minuteInput.replaceText(String(minute).padStart(2, "0"))
}

async function setTime(label, hour, minute) {
	await tapLabel(label)
	await replaceClockInputs(hour, minute)
	await tapText(/^Aceptar$/i, { scroll: false })
	await expectFieldValue(label, displayTime(hour, minute))
}

async function resetLoginAndLoadPermits() {
	const email = requiredEnvironment("E2E_USER_EMAIL")
	const password = requiredEnvironment("E2E_USER_PASSWORD")

	console.log("Resetting local app data...")
	console.log("Opening the Expo development client...")
	await device.launchApp({
		newInstance: true,
		resetAppState: true,
		url: `vicugna://expo-development-client/?url=${encodeURIComponent(EXPO_SERVER_URL)}`,
	})

	console.log("Waiting for the logged-out home screen...")
	const login = await byPressableLabel("Iniciar sesión", {
		scroll: false,
		timeout: 30_000,
	})

	for (const permit of [HAPPY_PERMIT, VALIDATION_PERMIT]) {
		await detoxExpect(element(by.text(permit))).not.toExist()
	}

	console.log("Logging in...")
	await login.tap()
	await replaceField("Inicio de sesión: correo", email)
	await replaceField("Inicio de sesión: contraseña", password)
	await tapLabel("Enviar inicio de sesión")

	console.log("Waiting for TEST-01 and TEST-02...")
	for (const permit of [HAPPY_PERMIT, VALIDATION_PERMIT]) {
		await byLabelContaining(`Permiso ${permit}`, { timeout: 120_000 })
	}
	console.log("Test permits loaded")
}

async function openPermit(permitNumber) {
	await tapLabelContaining(`Permiso ${permitNumber}`)
	await expectText(permitNumber)
}

module.exports = {
	HAPPY_PERMIT,
	VALIDATION_PERMIT,
	byLabel,
	byLabelContaining,
	byPressableLabel,
	byText,
	drawSignature,
	expectChecked,
	expectEnabled,
	expectFieldValue,
	expectText,
	getFieldValue,
	openPermit,
	replaceField,
	resetLoginAndLoadPermits,
	setTime,
	tapLabel,
	tapLabelContaining,
	tapText,
	waitForFieldValueChange,
}
