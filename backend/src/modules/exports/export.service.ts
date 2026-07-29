import path from "node:path"
import ExcelJS from "exceljs"
import JSZip from "jszip"
import {
	getCommunityNameById,
	getRegionalNameByCommunityId,
} from "../common/common.catalog"
import {
	alignCenterMiddleCells,
	alignLeftMiddleCells,
} from "./export.excel_format"
import { findSyncedPermitForExport } from "./export.repository"
import { renderSignaturePng } from "./export.signature_renderer"

type ExportFile = {
	buffer: Buffer
	fileName: string
}

const PARTICIPANTS_TEMPLATE_FILE =
	"Form 12 - Registro de participantes v17ago23.xlsx"
const PARTICIPANTS_SHEET_NAME = "Hoja1"
const FIRST_PARTICIPANT_ROW = 12
const LAST_TEMPLATE_PARTICIPANT_ROW = 31
const SHEARING_TEMPLATE_FILE =
	"Form 10 - Registro de captura y esquila-v SISTEMA 17ago23.xlsx"
const SHEARING_SHEET_NAME = "2. Registro de Esquila"
const FIRST_SHEARING_ROW = 14
const LAST_TEMPLATE_SHEARING_ROW = 31
const CLEANING_TEMPLATE_FILE = "Form 11 - Registro de fibra v17ago23.xlsx"
const CLEANING_SHEET_NAME = "Hoja1"
const FIRST_CLEANING_ROW = 14
const LAST_TEMPLATE_CLEANING_ROW = 23
const SIGNATURE_IMAGE_RANGE = {
	topLeftColumn: 7.05,
	topOffset: 0.9,
	width: 52,
	height: 20,
} as const
const CLEANING_SIGNATURE_IMAGE_RANGE = {
	topLeftColumn: 12.1,
	topOffset: 0.9,
	width: 44,
	height: 18,
} as const

type SyncedPermitForExport = Awaited<
	ReturnType<typeof findSyncedPermitForExport>
>

export async function generatePermitReportsArchive(
	permitId: string,
): Promise<ExportFile> {
	const permit = await getSyncedPermitForExport(permitId)

	const [participantsExport, shearingExport, cleaningExport] =
		await Promise.all([
			generateParticipantsRegisterExportFromPermit(permit),
			generateShearingRegisterExportFromPermit(permit),
			generateCleaningRegisterExportFromPermit(permit),
		])

	const zip = new JSZip()

	zip.file(participantsExport.fileName, participantsExport.buffer)
	zip.file(shearingExport.fileName, shearingExport.buffer)
	zip.file(cleaningExport.fileName, cleaningExport.buffer)

	return {
		buffer: toNodeBuffer(await zip.generateAsync({ type: "nodebuffer" })),
		fileName: `reportes-${permit.permitNumber}.zip`,
	}
}

function toNodeBuffer(data: ArrayBuffer | Buffer) {
	return Buffer.isBuffer(data) ? data : Buffer.from(data)
}

async function getSyncedPermitForExport(permitId: string) {
	const permit = await findSyncedPermitForExport(permitId)

	if (!permit?.isSynced) {
		throw new Error("Permit sync data is not available")
	}

	return permit
}

function getTemplatePath(fileName: string) {
	return path.resolve(
		process.cwd(),
		"src/modules/exports/templates",
		fileName,
	)
}

function resetWorksheetOpenView(
	worksheet: ExcelJS.Worksheet,
	topLeftCell: string,
) {
	worksheet.views = [
		{
			state: "frozen",
			xSplit: 0,
			ySplit: 0,
			topLeftCell,
			activeCell: topLeftCell,
		},
	]
}

// ==========================================
// PARTICIPANTS
// ==========================================

export async function generateParticipantsRegisterExport(
	permitId: string,
): Promise<ExportFile> {
	const permit = await getSyncedPermitForExport(permitId)

	return generateParticipantsRegisterExportFromPermit(permit)
}

async function generateParticipantsRegisterExportFromPermit(
	permit: NonNullable<SyncedPermitForExport>,
): Promise<ExportFile> {
	const workbook = new ExcelJS.Workbook()
	await workbook.xlsx.readFile(getTemplatePath(PARTICIPANTS_TEMPLATE_FILE))

	const worksheet = workbook.getWorksheet(PARTICIPANTS_SHEET_NAME)

	if (!worksheet) {
		throw new Error("Participants template sheet was not found")
	}

	resetWorksheetOpenView(worksheet, "A1")
	const margins = worksheet.pageSetup.margins ?? {
		top: 0.75,
		left: 0.7,
		right: 0.7,
		bottom: 0.75,
		header: 0.3,
		footer: 0.3,
	}
	worksheet.pageSetup.margins = {
		top: margins.top,
		left: margins.left,
		right: 0.2,
		bottom: margins.bottom,
		header: margins.header,
		footer: margins.footer,
	}
	worksheet.pageSetup.fitToPage = true
	worksheet.pageSetup.fitToWidth = 1
	worksheet.pageSetup.fitToHeight = 0

	ensureParticipantRows(worksheet, permit.participants.length)
	setParticipantTotalsFormula(worksheet, permit.participants.length)

	worksheet.getCell("D5").value = await getRegionalNameByCommunityId(
		permit.communityId,
	)
	worksheet.getCell("D6").value = await getCommunityNameById(
		permit.communityId,
	)
	worksheet.getCell("I5").value = permit.shearingHeader?.eventDate ?? ""
	worksheet.getCell("I6").value = permit.shearingHeader?.site ?? ""

	alignLeftMiddleCells(worksheet, ["D5", "D6", "I5", "I6"])

	for (const [index, participant] of permit.participants.entries()) {
		const rowNumber = FIRST_PARTICIPANT_ROW + index

		worksheet.getCell(`A${rowNumber}`).value = index + 1
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
		buffer: toNodeBuffer(await workbook.xlsx.writeBuffer()),
		fileName: `registro-participantes-${permit.permitNumber}.xlsx`,
	}
}

function alignParticipantRow(worksheet: ExcelJS.Worksheet, rowNumber: number) {
	alignCenterMiddleCells(worksheet, [`E${rowNumber}`, `F${rowNumber}`])
	alignLeftMiddleCells(worksheet, [`B${rowNumber}`, `G${rowNumber}`])
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
		worksheet.unMergeCells(`B${rowNumber}:D${rowNumber}`)
		worksheet.mergeCells(`B${rowNumber}:D${rowNumber}`)
	}
}

function setParticipantTotalsFormula(
	worksheet: ExcelJS.Worksheet,
	participantsCount: number,
) {
	const extraRows = Math.max(
		0,
		participantsCount -
			(LAST_TEMPLATE_PARTICIPANT_ROW - FIRST_PARTICIPANT_ROW + 1),
	)
	const lastRow = Math.max(
		LAST_TEMPLATE_PARTICIPANT_ROW,
		FIRST_PARTICIPANT_ROW + participantsCount - 1,
	)
	const totalsRow = LAST_TEMPLATE_PARTICIPANT_ROW + extraRows + 1

	worksheet.getCell(`E${totalsRow}`).value = {
		formula: `COUNTIF(E12:E${lastRow},"X")`,
	}
	worksheet.getCell(`F${totalsRow}`).value = {
		formula: `COUNTIF(F12:F${lastRow},"X")`,
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

// ==========================================
// SHEARING
// ==========================================

export async function generateShearingRegisterExport(
	permitId: string,
): Promise<ExportFile> {
	const permit = await getSyncedPermitForExport(permitId)

	return generateShearingRegisterExportFromPermit(permit)
}

async function generateShearingRegisterExportFromPermit(
	permit: NonNullable<SyncedPermitForExport>,
): Promise<ExportFile> {
	const workbook = new ExcelJS.Workbook()
	await workbook.xlsx.readFile(getTemplatePath(SHEARING_TEMPLATE_FILE))

	const worksheet = workbook.getWorksheet(SHEARING_SHEET_NAME)

	if (!worksheet) {
		throw new Error("Shearing template sheet was not found")
	}

	resetWorksheetOpenView(worksheet, "A6")
	ensureShearingRows(worksheet, permit.shearingRecords.length)
	setShearingTotalsFormula(worksheet, permit.shearingRecords.length)
	setShearingPrintLayout(worksheet, permit.shearingRecords.length)

	const shearingHeader = permit.shearingHeader

	worksheet.getCell("F8").value = await getRegionalNameByCommunityId(
		permit.communityId,
	)
	worksheet.getCell("F9").value = await getCommunityNameById(
		permit.communityId,
	)
	worksheet.getCell("G10").value = shearingHeader?.latitude ?? ""
	worksheet.getCell("J10").value = shearingHeader?.longitude ?? ""
	worksheet.getCell("Q8").value = shearingHeader?.site ?? ""
	worksheet.getCell("Q9").value = shearingHeader?.eventDate ?? ""
	worksheet.getCell("Q10").value = shearingHeader?.roundupCount ?? ""
	worksheet.getCell("Y8").value = shearingHeader?.startTime ?? ""
	worksheet.getCell("Y9").value = shearingHeader?.endTime ?? ""
	worksheet.getCell("Y10").value = permit.permitNumber

	for (const [index, record] of permit.shearingRecords.entries()) {
		const rowNumber = FIRST_SHEARING_ROW + index

		worksheet.getCell(`B${rowNumber}`).value = record.tagNumber
		worksheet.getCell(`C${rowNumber}`).value = record.sex === "M" ? "X" : ""
		worksheet.getCell(`D${rowNumber}`).value = record.sex === "F" ? "X" : ""
		worksheet.getCell(`E${rowNumber}`).value =
			record.ageCategory === "Cria" ? "X" : ""
		worksheet.getCell(`F${rowNumber}`).value =
			record.ageCategory === "Juvenil" ? "X" : ""
		worksheet.getCell(`G${rowNumber}`).value =
			record.ageCategory === "Adulto" ? "X" : ""
		worksheet.getCell(`H${rowNumber}`).value = record.liveWeight
		worksheet.getCell(`I${rowNumber}`).value = record.fiberLength
		worksheet.getCell(`J${rowNumber}`).value =
			record.bodyCondition === "Malo" ? "X" : ""
		worksheet.getCell(`K${rowNumber}`).value =
			record.bodyCondition === "Regular" ? "X" : ""
		worksheet.getCell(`L${rowNumber}`).value =
			record.bodyCondition === "Bueno" ? "X" : ""
		worksheet.getCell(`M${rowNumber}`).value =
			record.gestationStatus === "Si" ? "X" : ""
		worksheet.getCell(`N${rowNumber}`).value =
			record.gestationStatus === "No" ? "X" : ""
		worksheet.getCell(`O${rowNumber}`).value =
			record.gestationStatus === "Si ultimo tercio" ? "X" : ""
		worksheet.getCell(`P${rowNumber}`).value =
			record.externalParasites === "Garrapata" ? "X" : ""
		worksheet.getCell(`Q${rowNumber}`).value =
			record.externalParasites === "Piojos" ? "X" : ""
		worksheet.getCell(`R${rowNumber}`).value =
			record.mangeSeverity === "Leve" ? "X" : ""
		worksheet.getCell(`S${rowNumber}`).value =
			record.mangeSeverity === "Moderado" ? "X" : ""
		worksheet.getCell(`T${rowNumber}`).value =
			record.mangeSeverity === "Severo" ? "X" : ""
		worksheet.getCell(`U${rowNumber}`).value = record.hasDandruff ? "X" : ""
		worksheet.getCell(`V${rowNumber}`).value = record.isSheared ? "X" : ""
		worksheet.getCell(`W${rowNumber}`).value = record.isSheared ? "" : "X"
		worksheet.getCell(`X${rowNumber}`).value = record.isDead ? "X" : ""
		worksheet.getCell(`Y${rowNumber}`).value = record.observations
	}

	return {
		buffer: toNodeBuffer(await workbook.xlsx.writeBuffer()),
		fileName: `registro-esquila-${permit.permitNumber}.xlsx`,
	}
}

function ensureShearingRows(
	worksheet: ExcelJS.Worksheet,
	shearingRecordsCount: number,
) {
	const extraRows =
		shearingRecordsCount -
		(LAST_TEMPLATE_SHEARING_ROW - FIRST_SHEARING_ROW + 1)

	if (extraRows <= 0) {
		return
	}

	worksheet.duplicateRow(LAST_TEMPLATE_SHEARING_ROW, extraRows, true)
}

function setShearingTotalsFormula(
	worksheet: ExcelJS.Worksheet,
	shearingRecordsCount: number,
) {
	const extraRows = Math.max(
		0,
		shearingRecordsCount -
			(LAST_TEMPLATE_SHEARING_ROW - FIRST_SHEARING_ROW + 1),
	)
	const lastRow = Math.max(
		LAST_TEMPLATE_SHEARING_ROW,
		FIRST_SHEARING_ROW + shearingRecordsCount - 1,
	)
	const totalsRow = LAST_TEMPLATE_SHEARING_ROW + extraRows + 1

	const countedColumns = [
		"C",
		"D",
		"E",
		"F",
		"G",
		"J",
		"K",
		"L",
		"M",
		"N",
		"O",
		"P",
		"Q",
		"R",
		"S",
		"T",
		"U",
		"V",
		"W",
		"X",
	]

	for (const column of countedColumns) {
		worksheet.getCell(`${column}${totalsRow}`).value = {
			formula: `COUNTIF(${column}${FIRST_SHEARING_ROW}:${column}${lastRow},"X")`,
		}
	}

	worksheet.getCell(`H${totalsRow}`).value = {
		formula: `SUM(H${FIRST_SHEARING_ROW}:H${lastRow})`,
	}
	worksheet.getCell(`I${totalsRow}`).value = {
		formula: `SUM(I${FIRST_SHEARING_ROW}:I${lastRow})`,
	}
}

function setShearingPrintLayout(
	worksheet: ExcelJS.Worksheet,
	shearingRecordsCount: number,
) {
	const extraRows = Math.max(
		0,
		shearingRecordsCount -
			(LAST_TEMPLATE_SHEARING_ROW - FIRST_SHEARING_ROW + 1),
	)
	const totalsRow = LAST_TEMPLATE_SHEARING_ROW + extraRows + 1

	worksheet.pageSetup.fitToPage = true
	worksheet.pageSetup.fitToWidth = 1
	worksheet.pageSetup.fitToHeight = 0
	worksheet.pageSetup.printArea = `A6:Z${totalsRow + 1}`
}

// ==========================================
// CLEANING
// ==========================================

export async function generateCleaningRegisterExport(
	permitId: string,
): Promise<ExportFile> {
	const permit = await getSyncedPermitForExport(permitId)

	return generateCleaningRegisterExportFromPermit(permit)
}

async function generateCleaningRegisterExportFromPermit(
	permit: NonNullable<SyncedPermitForExport>,
): Promise<ExportFile> {
	const workbook = new ExcelJS.Workbook()
	await workbook.xlsx.readFile(getTemplatePath(CLEANING_TEMPLATE_FILE))

	const worksheet = workbook.getWorksheet(CLEANING_SHEET_NAME)

	if (!worksheet) {
		throw new Error("Cleaning template sheet was not found")
	}

	resetWorksheetOpenView(worksheet, "A1")
	ensureCleaningRows(worksheet, permit.cleaningCommonRecords.length)
	setCleaningTotalsFormula(worksheet, permit.cleaningCommonRecords.length)
	setCleaningPrintLayout(worksheet, permit.cleaningCommonRecords.length)

	const shearingHeader = permit.shearingHeader
	const cleaningHeader = permit.cleaningHeader

	worksheet.getCell("D6").value = await getRegionalNameByCommunityId(
		permit.communityId,
	)
	worksheet.getCell("D7").value = await getCommunityNameById(
		permit.communityId,
	)
	worksheet.getCell("D8").value = shearingHeader?.site ?? ""
	worksheet.getCell("D9").value = shearingHeader?.eventDate ?? ""
	worksheet.getCell("D10").value = permit.permitNumber
	worksheet.getCell("L6").value = cleaningHeader?.startDate ?? ""
	worksheet.getCell("L7").value = cleaningHeader?.endDate ?? ""
	worksheet.getCell("L8").value = cleaningHeader?.site ?? ""
	worksheet.getCell("L9").value = cleaningHeader?.supervisors ?? ""

	for (const [index, record] of permit.cleaningCommonRecords.entries()) {
		const rowNumber = FIRST_CLEANING_ROW + index

		worksheet.getCell(`A${rowNumber}`).value = index + 1
		worksheet.getCell(`B${rowNumber}`).value = record.fleeceNumber
		worksheet.getCell(`C${rowNumber}`).value = record.grossWeight
		worksheet.getCell(`D${rowNumber}`).value =
			record.grooming?.cleanWeight ?? ""
		worksheet.getCell(`E${rowNumber}`).value =
			record.grooming?.dirtyWeight ?? ""
		worksheet.getCell(`F${rowNumber}`).value =
			record.grooming?.totalWeight ?? ""
		worksheet.getCell(`H${rowNumber}`).value =
			record.dehearing?.dehairedWeight ?? ""
		worksheet.getCell(`I${rowNumber}`).value =
			record.dehearing?.bristleWeight ?? ""
		worksheet.getCell(`J${rowNumber}`).value = record.dehearing?.hasDandruff
			? "X"
			: ""
		worksheet.getCell(`K${rowNumber}`).value =
			record.dehearing?.dehairerName ?? ""
		await writeCleaningSignatureCell(
			workbook,
			worksheet,
			rowNumber,
			record.dehearing?.signature ?? "",
		)
	}

	return {
		buffer: toNodeBuffer(await workbook.xlsx.writeBuffer()),
		fileName: `registro-fibra-${permit.permitNumber}.xlsx`,
	}
}

function ensureCleaningRows(
	worksheet: ExcelJS.Worksheet,
	cleaningRecordsCount: number,
) {
	const extraRows =
		cleaningRecordsCount -
		(LAST_TEMPLATE_CLEANING_ROW - FIRST_CLEANING_ROW + 1)

	if (extraRows <= 0) {
		return
	}

	worksheet.duplicateRow(LAST_TEMPLATE_CLEANING_ROW, extraRows, true)

	for (
		let rowNumber = LAST_TEMPLATE_CLEANING_ROW + 1;
		rowNumber <= LAST_TEMPLATE_CLEANING_ROW + extraRows;
		rowNumber++
	) {
		worksheet.unMergeCells(`F${rowNumber}:G${rowNumber}`)
		worksheet.mergeCells(`F${rowNumber}:G${rowNumber}`)
		worksheet.unMergeCells(`K${rowNumber}:L${rowNumber}`)
		worksheet.mergeCells(`K${rowNumber}:L${rowNumber}`)
	}
}

function setCleaningTotalsFormula(
	worksheet: ExcelJS.Worksheet,
	cleaningRecordsCount: number,
) {
	const extraRows = Math.max(
		0,
		cleaningRecordsCount -
			(LAST_TEMPLATE_CLEANING_ROW - FIRST_CLEANING_ROW + 1),
	)
	const lastRow = Math.max(
		LAST_TEMPLATE_CLEANING_ROW,
		FIRST_CLEANING_ROW + cleaningRecordsCount - 1,
	)
	const totalsRow = LAST_TEMPLATE_CLEANING_ROW + extraRows + 1

	worksheet.getCell(`B${totalsRow}`).value = {
		formula: `COUNTA(B${FIRST_CLEANING_ROW}:B${lastRow})`,
	}
	worksheet.getCell(`C${totalsRow}`).value = {
		formula: `SUM(C${FIRST_CLEANING_ROW}:C${lastRow})`,
	}
	worksheet.getCell(`D${totalsRow}`).value = {
		formula: `SUM(D${FIRST_CLEANING_ROW}:D${lastRow})`,
	}
	worksheet.getCell(`E${totalsRow}`).value = {
		formula: `SUM(E${FIRST_CLEANING_ROW}:E${lastRow})`,
	}
	worksheet.getCell(`F${totalsRow}`).value = {
		formula: `SUM(F${FIRST_CLEANING_ROW}:F${lastRow})`,
	}
	worksheet.getCell(`H${totalsRow}`).value = {
		formula: `SUM(H${FIRST_CLEANING_ROW}:H${lastRow})`,
	}
	worksheet.getCell(`I${totalsRow}`).value = {
		formula: `SUM(I${FIRST_CLEANING_ROW}:I${lastRow})`,
	}
	worksheet.getCell(`J${totalsRow}`).value = {
		formula: `COUNTIF(J${FIRST_CLEANING_ROW}:J${lastRow},"X")`,
	}
}

function setCleaningPrintLayout(
	worksheet: ExcelJS.Worksheet,
	cleaningRecordsCount: number,
) {
	const extraRows = Math.max(
		0,
		cleaningRecordsCount -
			(LAST_TEMPLATE_CLEANING_ROW - FIRST_CLEANING_ROW + 1),
	)
	const totalsRow = LAST_TEMPLATE_CLEANING_ROW + extraRows + 1

	worksheet.pageSetup.fitToPage = true
	worksheet.pageSetup.fitToWidth = 1
	worksheet.pageSetup.fitToHeight = 0
	worksheet.pageSetup.printArea = `A1:M${totalsRow}`
}

async function writeCleaningSignatureCell(
	workbook: ExcelJS.Workbook,
	worksheet: ExcelJS.Worksheet,
	rowNumber: number,
	signature: string,
) {
	const cell = worksheet.getCell(`M${rowNumber}`)

	if (!signature) {
		cell.value = ""
		return
	}

	const imageBuffer = await renderSignaturePng(signature)

	if (!imageBuffer) {
		cell.value = signature
		return
	}

	const imageId = workbook.addImage({
		buffer: imageBuffer,
		extension: "png",
	})

	worksheet.addImage(imageId, {
		tl: {
			col: CLEANING_SIGNATURE_IMAGE_RANGE.topLeftColumn,
			row: rowNumber - CLEANING_SIGNATURE_IMAGE_RANGE.topOffset,
		},
		ext: {
			width: CLEANING_SIGNATURE_IMAGE_RANGE.width,
			height: CLEANING_SIGNATURE_IMAGE_RANGE.height,
		},
		editAs: "oneCell",
	})
}
