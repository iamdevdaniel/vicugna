import path from "node:path"
import ExcelJS from "exceljs"
import {
	getCommunityNameById,
	getRegionalNameByCommunityId,
} from "../common/common.catalog"
import { findSyncedPermitForParticipantExport } from "./export.repository"
import { renderSignaturePng } from "./export.signature_renderer"

type ExportFile = {
	buffer: Awaited<ReturnType<ExcelJS.Workbook["xlsx"]["writeBuffer"]>>
	fileName: string
}

const PARTICIPANTS_TEMPLATE_FILE =
	"Form 12 - Registro de participantes v17ago23.xlsx"
const PARTICIPANTS_SHEET_NAME = "Hoja1"
const FIRST_PARTICIPANT_ROW = 12
const LAST_TEMPLATE_PARTICIPANT_ROW = 31
const SIGNATURE_IMAGE_RANGE = {
	topLeftColumn: 7.05,
	topOffset: 0.9,
	width: 52,
	height: 20,
} as const

export async function generateParticipantsRegisterExport(
	permitId: string,
): Promise<ExportFile> {
	const permit = await findSyncedPermitForParticipantExport(permitId)

	if (!permit?.isSynced) {
		throw new Error("Permit sync data is not available")
	}

	const workbook = new ExcelJS.Workbook()
	await workbook.xlsx.readFile(getParticipantsTemplatePath())

	const worksheet = workbook.getWorksheet(PARTICIPANTS_SHEET_NAME)

	if (!worksheet) {
		throw new Error("Participants template sheet was not found")
	}

	ensureParticipantRows(worksheet, permit.participants.length)

	worksheet.getCell("D5").value = await getRegionalNameByCommunityId(
		permit.communityId,
	)
	worksheet.getCell("D6").value = await getCommunityNameById(
		permit.communityId,
	)
	// TODO: fill the shearing date once that field is persisted in the synced data.

	worksheet.getCell("I5").value = ""
	worksheet.getCell("I6").value = permit.shearingHeader?.site ?? ""

	alignLeftMiddleCells(worksheet, ["D5", "D6", "I5", "I6"])

	for (const [index, participant] of permit.participants.entries()) {
		const rowNumber = FIRST_PARTICIPANT_ROW + index

		worksheet.getCell(`B${rowNumber}`).value =
			`${participant.name} ${participant.lastNames}`.trim()
		worksheet.getCell(`E${rowNumber}`).value =
			participant.gender === "M" ? "X" : ""
		worksheet.getCell(`F${rowNumber}`).value =
			participant.gender === "F" ? "X" : ""
		worksheet.getCell(`G${rowNumber}`).value = participant.identityNumber
		await writeParticipantSignatureCell(
			workbook,
			worksheet,
			rowNumber,
			participant.signature,
		)
		worksheet.getCell(`I${rowNumber}`).value = participant.notes

		alignParticipantRow(worksheet, rowNumber)
	}

	return {
		buffer: await workbook.xlsx.writeBuffer(),
		fileName: `registro-participantes-${permit.permitNumber}.xlsx`,
	}
}

function alignLeftMiddleCells(
	worksheet: ExcelJS.Worksheet,
	addresses: string[],
) {
	alignCells(worksheet, addresses, {
		horizontal: "left",
		vertical: "middle",
	})
}

function alignCenterMiddleCells(
	worksheet: ExcelJS.Worksheet,
	addresses: string[],
) {
	alignCells(worksheet, addresses, {
		horizontal: "center",
		vertical: "middle",
	})
}

function alignCells(
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

function alignParticipantRow(worksheet: ExcelJS.Worksheet, rowNumber: number) {
	alignCenterMiddleCells(worksheet, [`E${rowNumber}`, `F${rowNumber}`])
	alignLeftMiddleCells(worksheet, [`B${rowNumber}`, `G${rowNumber}`])
}

function getParticipantsTemplatePath() {
	return path.resolve(
		process.cwd(),
		"src/modules/exports/templates",
		PARTICIPANTS_TEMPLATE_FILE,
	)
}

function ensureParticipantRows(
	worksheet: ExcelJS.Worksheet,
	participantsCount: number,
) {
	const extraRows =
		participantsCount -
		(LAST_TEMPLATE_PARTICIPANT_ROW - FIRST_PARTICIPANT_ROW + 1)

	if (extraRows <= 0) {
		return
	}

	worksheet.duplicateRow(LAST_TEMPLATE_PARTICIPANT_ROW, extraRows, true)

	for (
		let rowNumber = LAST_TEMPLATE_PARTICIPANT_ROW + 1;
		rowNumber <= LAST_TEMPLATE_PARTICIPANT_ROW + extraRows;
		rowNumber++
	) {
		worksheet.mergeCells(`B${rowNumber}:D${rowNumber}`)
	}
}

async function writeParticipantSignatureCell(
	workbook: ExcelJS.Workbook,
	worksheet: ExcelJS.Worksheet,
	rowNumber: number,
	signature: string,
) {
	const cell = worksheet.getCell(`H${rowNumber}`)

	if (!signature) {
		cell.value = ""
		return
	}

	const imageBuffer = await renderSignaturePng(signature)

	if (!imageBuffer) {
		cell.value = signature
		cell.alignment = {
			...cell.alignment,
			horizontal: "left",
			vertical: "middle",
		}
		return
	}

	const imageId = workbook.addImage({
		buffer: imageBuffer,
		extension: "png",
	})

	worksheet.addImage(imageId, {
		tl: {
			col: SIGNATURE_IMAGE_RANGE.topLeftColumn,
			row: rowNumber - SIGNATURE_IMAGE_RANGE.topOffset,
		},
		ext: {
			width: SIGNATURE_IMAGE_RANGE.width,
			height: SIGNATURE_IMAGE_RANGE.height,
		},
		editAs: "oneCell",
	})
}
