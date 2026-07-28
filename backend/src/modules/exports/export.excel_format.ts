import type ExcelJS from "exceljs"

export function alignLeftMiddleCells(
	worksheet: ExcelJS.Worksheet,
	addresses: string[],
) {
	alignCells(worksheet, addresses, {
		horizontal: "left",
		vertical: "middle",
	})
}

export function alignCenterMiddleCells(
	worksheet: ExcelJS.Worksheet,
	addresses: string[],
) {
	alignCells(worksheet, addresses, {
		horizontal: "center",
		vertical: "middle",
	})
}

export function alignCells(
	worksheet: ExcelJS.Worksheet,
	addresses: string[],
	alignment: Partial<ExcelJS.Alignment>,
) {
	for (const address of addresses) {
		const cell = worksheet.getCell(address)

		cell.alignment = {
			...cell.alignment,
			...alignment,
		}
	}
}
