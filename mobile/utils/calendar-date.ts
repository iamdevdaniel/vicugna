const calendarDatePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/
const legacyCalendarDatePattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/

export function formatCalendarDate(date: Date): string {
	const day = String(date.getDate()).padStart(2, "0")
	const month = String(date.getMonth() + 1).padStart(2, "0")
	return `${day}/${month}/${date.getFullYear()}`
}

export function isValidCalendarDate(value: string): boolean {
	const match = calendarDatePattern.exec(value)
	if (!match) return false
	return isRealCalendarDate(match)
}

export function normalizeCalendarDate(value: string): string {
	const match = legacyCalendarDatePattern.exec(value)
	if (!match || !isRealCalendarDate(match)) return value

	const [, dayText, monthText, yearText] = match
	return `${dayText.padStart(2, "0")}/${monthText.padStart(2, "0")}/${yearText}`
}

function isRealCalendarDate(match: RegExpExecArray): boolean {
	const day = Number(match[1])
	const month = Number(match[2])
	const year = Number(match[3])
	const date = new Date(year, month - 1, day)

	return (
		date.getFullYear() === year &&
		date.getMonth() === month - 1 &&
		date.getDate() === day
	)
}
