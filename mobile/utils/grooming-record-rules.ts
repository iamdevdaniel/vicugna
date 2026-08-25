import Decimal from "decimal.js"

const decimalTextPattern = /^(?:\d+|\d*\.\d+)$/

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

	return new Decimal(cleanWeight).plus(dirtyWeight).toString()
}

export function isWeightLessThanOrEqual(
	weight: string,
	limit: string,
): boolean | null {
	if (!decimalTextPattern.test(weight) || !decimalTextPattern.test(limit)) {
		return null
	}

	return new Decimal(weight).lessThanOrEqualTo(limit)
}
