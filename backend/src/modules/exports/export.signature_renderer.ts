import type ExcelJS from "exceljs"
import sharp from "sharp"

const SIGNATURE_WIDTH = 320
const SIGNATURE_HEIGHT = 100

const MAX_PATHS = 32
const MAX_SIGNATURE_BYTES = 150_000
const MAX_TOTAL_PATH_CHARS = 120_000
const MAX_SINGLE_PATH_CHARS = 60_000
type ExcelImageBuffer = NonNullable<
	Parameters<ExcelJS.Workbook["addImage"]>[0]["buffer"]
>

export async function renderSignaturePng(
	signature: string,
): Promise<ExcelImageBuffer | null> {
	const paths = parseSignaturePaths(signature)

	if (!paths) {
		return null
	}

	const pathElements = paths
		.map(
			(path) => `
				<path
					d="${escapeXmlAttribute(path)}"
					fill="none"
					stroke="#000000"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			`,
		)
		.join("")

	const svg = `
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="${SIGNATURE_WIDTH}"
			height="${SIGNATURE_HEIGHT}"
			viewBox="0 0 ${SIGNATURE_WIDTH} ${SIGNATURE_HEIGHT}"
		>
			${pathElements}
		</svg>
	`

	try {
		return (await sharp(Buffer.from(svg), {
			limitInputPixels: SIGNATURE_WIDTH * SIGNATURE_HEIGHT,
		})
			.png({
				compressionLevel: 6,
				palette: true,
				colours: 16,
			})
			.toBuffer()) as unknown as ExcelImageBuffer
	} catch {
		return null
	}
}

function parseSignaturePaths(signature: string): string[] | null {
	if (Buffer.byteLength(signature, "utf8") > MAX_SIGNATURE_BYTES) {
		return null
	}

	try {
		const parsed: unknown = JSON.parse(signature)

		if (
			!Array.isArray(parsed) ||
			parsed.length === 0 ||
			parsed.length > MAX_PATHS
		) {
			return null
		}

		if (
			!parsed.every(
				(path) =>
					typeof path === "string" &&
					path.length > 0 &&
					path.length <= MAX_SINGLE_PATH_CHARS &&
					isValidSvgPath(path),
			)
		) {
			return null
		}

		const totalPathCharacters = parsed.reduce(
			(total, path) => total + path.length,
			0,
		)

		if (totalPathCharacters > MAX_TOTAL_PATH_CHARS) {
			return null
		}

		return parsed
	} catch {
		return null
	}
}

function isValidSvgPath(path: string): boolean {
	return /^[MmLlHhVvCcSsQqTtAaZz0-9eE+\-.,\s]+$/.test(path)
}

function escapeXmlAttribute(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll('"', "&quot;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
}
