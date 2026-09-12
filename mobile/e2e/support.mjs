export const HAPPY_PERMIT = "TEST-01"
export const VALIDATION_PERMIT = "TEST-02"

const APP_ID = "com.maydanachi.vicugna"
const DEFAULT_TIMEOUT = 15_000
const EXPO_SERVER_URL =
	process.env.E2E_EXPO_URL?.trim() || "http://127.0.0.1:8081"

function requiredEnvironment(name) {
	const value = process.env[name]?.trim()
	if (!value) throw new Error(`Missing ${name} in mobile/.env`)
	return value
}

function escapedUiSelectorValue(value) {
	return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')
}

function escapedUiSelectorRegex(value) {
	return escapedUiSelectorValue(
		value.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&"),
	)
}

function labelUiSelector(label) {
	const pattern = `^${escapedUiSelectorRegex(label)}(?:, .*)?$`
	return `new UiSelector().descriptionMatches("${pattern}")`
}

export async function byLabel(
	driver,
	label,
	{ scroll = true, timeout = DEFAULT_TIMEOUT } = {},
) {
	const uiSelector = labelUiSelector(label)
	let element = await driver.$(`android=${uiSelector}`)
	if (await element.isDisplayed().catch(() => false)) return element

	if (scroll) {
		element = await driver.$(
			`android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(${uiSelector})`,
		)
	}
	await element.waitForDisplayed({ timeout })
	return element
}

export async function byLabelContaining(
	driver,
	value,
	{ scroll = true, timeout = DEFAULT_TIMEOUT } = {},
) {
	const escaped = escapedUiSelectorValue(value)
	let element = await driver.$(
		`android=new UiSelector().descriptionContains("${escaped}")`,
	)
	if (await element.isDisplayed().catch(() => false)) return element

	if (scroll) {
		element = await driver.$(
			`android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().descriptionContains("${escaped}"))`,
		)
	}
	await element.waitForDisplayed({ timeout })
	return element
}

export async function byText(driver, value, { scroll = true } = {}) {
	const escaped = escapedUiSelectorValue(value)
	let element = await driver.$(`android=new UiSelector().text("${escaped}")`)
	if (await element.isDisplayed().catch(() => false)) return element

	if (scroll) {
		element = await driver.$(
			`android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().text("${escaped}"))`,
		)
	}
	await element.waitForDisplayed({ timeout: DEFAULT_TIMEOUT })
	return element
}

export async function tapLabel(driver, label, options) {
	const element = await byLabel(driver, label, options)
	await element.click()
}

export async function tapLabelContaining(driver, value, options) {
	const element = await byLabelContaining(driver, value, options)
	await element.click()
}

export async function tapText(driver, value, options) {
	const element = await byText(driver, value, options)
	await element.click()
}

export async function replaceField(driver, label, value) {
	const element = await byLabel(driver, label)
	await element.click()
	await element.clearValue()
	await element.setValue(String(value))
	return element
}

export async function expectText(driver, value) {
	await byText(driver, value)
}

export async function getFieldValue(driver, label) {
	const element = await byLabel(driver, label)
	const text = await element.getText()
	const description = await element.getAttribute("content-desc")
	return text || description?.replace(`${label}, `, "") || ""
}

export async function waitForFieldValueChange(driver, label, previousValue) {
	let value = previousValue

	try {
		await driver.waitUntil(
			async () => {
				value = await getFieldValue(driver, label)
				return value !== previousValue
			},
			{ timeout: DEFAULT_TIMEOUT, interval: 100 },
		)
	} catch {
		throw new Error(`${label} did not change from ${previousValue}`)
	}

	return value
}

export async function expectFieldValue(driver, label, value) {
	const actual = await getFieldValue(driver, label)
	if (actual !== String(value)) {
		throw new Error(`${label} should contain ${value}, found ${actual}`)
	}
}

export async function expectEnabled(driver, label, enabled) {
	const element = await byLabel(driver, label)

	try {
		await driver.waitUntil(
			async () => (await element.isEnabled()) === enabled,
			{
				timeout: DEFAULT_TIMEOUT,
				interval: 100,
			},
		)
	} catch {
		throw new Error(
			`${label} should be ${enabled ? "enabled" : "disabled"}`,
		)
	}
}

export async function expectChecked(driver, label, checked) {
	const element = await byLabel(driver, label)
	const matchesExpectedState = async () => {
		const actual = await element.getAttribute("checked")
		return (actual === "true") === checked
	}

	try {
		await driver.waitUntil(matchesExpectedState, {
			timeout: DEFAULT_TIMEOUT,
			interval: 100,
		})
	} catch {
		throw new Error(
			`${label} should be ${checked ? "selected" : "unselected"}`,
		)
	}
}

export async function drawSignature(driver) {
	const element = await byLabel(driver, "Firma sin registrar")
	const { x, y } = await element.getLocation()
	const { width, height } = await element.getSize()

	await driver.performActions([
		{
			type: "pointer",
			id: "signature-finger",
			parameters: { pointerType: "touch" },
			actions: [
				{
					type: "pointerMove",
					duration: 0,
					x: Math.round(x + width * 0.2),
					y: Math.round(y + height * 0.65),
				},
				{ type: "pointerDown", button: 0 },
				{
					type: "pointerMove",
					duration: 250,
					x: Math.round(x + width * 0.45),
					y: Math.round(y + height * 0.3),
				},
				{
					type: "pointerMove",
					duration: 250,
					x: Math.round(x + width * 0.75),
					y: Math.round(y + height * 0.65),
				},
				{ type: "pointerUp", button: 0 },
			],
		},
	])
	await driver.releaseActions()
}

async function setNumberPickerValue(picker, target, modulus) {
	const input = await picker.$("android.widget.EditText")
	const current = Number(await input.getText())
	if (current === target) return

	const buttons = await picker.$$("android.widget.Button")
	if (buttons.length !== 2) {
		throw new Error("Android number picker did not expose its controls")
	}

	const next = Number(await buttons[1].getText())
	const step = (next - current + modulus) % modulus
	if (!step) throw new Error("Android number picker has an invalid step")

	const stepsTo = (direction) => {
		let value = current
		for (let count = 0; count < modulus; count += 1) {
			if (value === target) return count
			value = (value + direction * step + modulus) % modulus
		}
		return Number.POSITIVE_INFINITY
	}

	const forwardSteps = stepsTo(1)
	const backwardSteps = stepsTo(-1)
	const useForward = forwardSteps <= backwardSteps
	const presses = useForward ? forwardSteps : backwardSteps
	if (!Number.isFinite(presses)) {
		throw new Error(
			`Android number picker cannot reach ${target} from ${current}`,
		)
	}
	for (let count = 0; count < presses; count += 1) {
		await buttons[useForward ? 1 : 0].click()
	}

	const actual = Number(
		await (await picker.$("android.widget.EditText")).getText(),
	)
	if (actual !== target) {
		throw new Error(
			`Android number picker stayed at ${actual}, expected ${target}`,
		)
	}
}

export async function setTime(driver, label, hour, minute) {
	await tapLabel(driver, label)
	const picker = await driver.$("android.widget.TimePicker")
	await picker.waitForDisplayed({ timeout: DEFAULT_TIMEOUT })
	const numberPickers = await picker.$$("android.widget.NumberPicker")
	if (numberPickers.length !== 2) {
		throw new Error(
			`Android time picker for ${label} did not expose two number pickers`,
		)
	}
	await setNumberPickerValue(numberPickers[0], hour, 24)
	await setNumberPickerValue(numberPickers[1], minute, 60)
	const accept = await driver.$(
		'android=new UiSelector().textMatches("(?i)^aceptar$")',
	)
	await accept.click()
}

export async function resetLoginAndLoadPermits(driver) {
	const email = requiredEnvironment("E2E_USER_EMAIL")
	const password = requiredEnvironment("E2E_USER_PASSWORD")

	console.log("Resetting local app data...")
	await driver.execute("mobile: terminateApp", {
		appId: APP_ID,
		timeout: 0,
	})
	await driver.execute("mobile: clearApp", { appId: APP_ID })
	console.log("Opening the Expo development client...")
	await driver.execute("mobile: deepLink", {
		url: `vicugna://expo-development-client/?url=${encodeURIComponent(EXPO_SERVER_URL)}`,
		package: APP_ID,
		waitForLaunch: false,
	})

	console.log("Waiting for the logged-out home screen...")
	const login = await byLabel(driver, "Iniciar sesión", {
		scroll: false,
		timeout: 30_000,
	})

	for (const permit of [HAPPY_PERMIT, VALIDATION_PERMIT]) {
		const stalePermit = await driver.$(
			`android=new UiSelector().text("${permit}")`,
		)
		if (await stalePermit.isExisting()) {
			throw new Error(`${permit} survived the application-data reset`)
		}
	}

	console.log("Logging in...")
	await login.click()
	await replaceField(driver, "Inicio de sesión: correo", email)
	await replaceField(driver, "Inicio de sesión: contraseña", password)
	await tapLabel(driver, "Enviar inicio de sesión")

	console.log("Waiting for TEST-01 and TEST-02...")
	for (const permit of [HAPPY_PERMIT, VALIDATION_PERMIT]) {
		await byLabelContaining(driver, `Permiso ${permit}`, {
			timeout: 120_000,
		})
	}
	console.log("Test permits loaded")
}

export async function openPermit(driver, permitNumber) {
	await tapLabelContaining(driver, `Permiso ${permitNumber}`)
	await expectText(driver, permitNumber)
}
