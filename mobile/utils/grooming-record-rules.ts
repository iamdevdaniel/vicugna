const decimalTextPattern = /^(?:\d+|\d*\.\d+)$/

function getDecimalPlaces(value: string): number {
	return value.split(".")[1]?.length ?? 0
}

function toScaledInteger(value: string, decimalPlaces: number): bigint {
	const [whole = "0", fraction = ""] = value.split(".")
	return BigInt(`${whole || "0"}${fraction.padEnd(decimalPlaces, "0")}`)
}

export function calculateTotalWeight(
	cleanWeight: string,
	dirtyWeight: string,
): string {
	if (
		!decimalTextPattern.test(cleanWeight) ||
		!decimalTextPattern.test(dirtyWeight)
	) {
		return ""
	}

	const decimalPlaces = Math.max(
		getDecimalPlaces(cleanWeight),
		getDecimalPlaces(dirtyWeight),
	)
	const total = (
		toScaledInteger(cleanWeight, decimalPlaces) +
		toScaledInteger(dirtyWeight, decimalPlaces)
	)
		.toString()
		.padStart(decimalPlaces + 1, "0")

	if (decimalPlaces === 0) {
		return total
	}

	const whole = total.slice(0, -decimalPlaces)
	const fraction = total.slice(-decimalPlaces).replace(/0+$/, "")
	return fraction ? `${whole}.${fraction}` : whole
}
