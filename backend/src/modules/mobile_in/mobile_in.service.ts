import Decimal from "decimal.js"
import { getMobileUserFromAuthorization } from "../mobile-auth/mobile_auth.service"
import { PermitValidationError } from "./mobile_in.errors"
import { saveSyncFieldData } from "./mobile_in.repository"
import type {
	CleaningCommonData,
	GroomingData,
	ShearingRecordData,
	SyncFieldData,
} from "./mobile_in.types"

export async function submitSyncFieldData(
	data: SyncFieldData,
	authorizationHeader: string,
) {
	const user = await getMobileUserFromAuthorization(authorizationHeader)
	validatePermit(data)
	validateParticipants(data)
	validateShearing(data)
	validateCleaning(data)

	return saveSyncFieldData(data, user.id)
}

function validatePermit(data: SyncFieldData): void {
	if (!data.permit.id) {
		throw new PermitValidationError(
			"El identificador del permiso es obligatorio",
		)
	}

	if (
		data.expectedSyncVersion !== null &&
		(!Number.isInteger(data.expectedSyncVersion) ||
			data.expectedSyncVersion < 1)
	) {
		throw new PermitValidationError("La versión del permiso no es válida")
	}
}

function validateParticipants(data: SyncFieldData): void {
	if (!data.participants.length) {
		throw new PermitValidationError("No hay participantes")
	}

	ensureUniqueIds(
		data.participants.map((participant) => participant.id),
		"El participante",
	)

	for (const participant of data.participants) {
		if (participant.permitId !== data.permit.id) {
			throw new PermitValidationError(
				"El participante no pertenece al permiso",
			)
		}
	}
}

function validateShearing(data: SyncFieldData): void {
	if (!data.shearingHeader) {
		throw new PermitValidationError("La cabecera de esquila es obligatoria")
	}

	if (data.shearingHeader.permitId !== data.permit.id) {
		throw new PermitValidationError(
			"La cabecera de esquila no pertenece al permiso",
		)
	}

	if (!data.shearingRecords.length) {
		throw new PermitValidationError("No hay registros de esquila")
	}

	ensureUniqueIds(
		data.shearingRecords.map((record) => record.id),
		"El registro de esquila",
	)

	for (const record of data.shearingRecords) {
		if (record.permitId !== data.permit.id) {
			throw new PermitValidationError(
				"El registro de esquila no pertenece al permiso",
			)
		}

		validateShearingRecordRules(record)
	}
}

function validateShearingRecordRules(record: ShearingRecordData): void {
	const gestationAllowed =
		record.sex === "F" && record.ageCategory === "Adulto"
	if (!gestationAllowed && record.gestationStatus !== "No") {
		throw new PermitValidationError(
			"Solo una hembra adulta puede estar en gestación",
		)
	}

	const shouldBeSheared =
		record.ageCategory !== "Cria" && record.gestationStatus !== "Si"
	if (record.isSheared !== shouldBeSheared) {
		throw new PermitValidationError(
			"El estado de esquila no coincide con la edad y la gestación",
		)
	}
}

function validateCleaning(data: SyncFieldData): void {
	if (!data.cleaningHeader) {
		throw new PermitValidationError(
			"La información general del registro de fibra es obligatoria",
		)
	}

	if (data.cleaningHeader.permitId !== data.permit.id) {
		throw new PermitValidationError(
			"La información general del registro de fibra no pertenece al permiso",
		)
	}

	if (!data.cleaningCommonRecords.length) {
		throw new PermitValidationError("No hay registros de fibra")
	}

	if (
		data.groomingDetails.length + data.dehearingDetails.length !==
		data.cleaningCommonRecords.length
	) {
		throw new PermitValidationError(
			"Cada registro de fibra debe tener un detalle",
		)
	}

	ensureUniqueIds(
		data.cleaningCommonRecords.map((record) => record.id),
		"El registro de fibra",
	)
	ensureUniqueIds(
		data.groomingDetails.map((detail) => detail.cleaningCommonId),
		"La relación de limpiado",
	)
	ensureUniqueIds(
		data.groomingDetails.map((detail) => detail.id),
		"El detalle de limpiado",
	)
	ensureUniqueIds(
		data.dehearingDetails.map((detail) => detail.cleaningCommonId),
		"La relación de predescerdado",
	)
	ensureUniqueIds(
		data.dehearingDetails.map((detail) => detail.id),
		"El detalle de predescerdado",
	)

	for (const record of data.cleaningCommonRecords) {
		if (record.permitId !== data.permit.id) {
			throw new PermitValidationError(
				"El registro de fibra no pertenece al permiso",
			)
		}
		if (!isPositiveFiniteNumber(record.grossWeight)) {
			throw new PermitValidationError("El peso bruto no es válido")
		}
	}

	const cleaningRecordsById = new Map(
		data.cleaningCommonRecords.map((record) => [record.id, record]),
	)
	const usedDetailIds = new Set<string>()

	for (const detail of data.groomingDetails) {
		const commonRecord = cleaningRecordsById.get(detail.cleaningCommonId)

		if (!commonRecord) {
			throw new PermitValidationError(
				"El detalle de limpiado no pertenece al registro de fibra",
			)
		}

		validateGroomingWeights(commonRecord, detail)
		usedDetailIds.add(detail.cleaningCommonId)
	}

	for (const detail of data.dehearingDetails) {
		if (!cleaningRecordsById.has(detail.cleaningCommonId)) {
			throw new PermitValidationError(
				"El detalle de predescerdado no pertenece al registro de fibra",
			)
		}

		if (usedDetailIds.has(detail.cleaningCommonId)) {
			throw new PermitValidationError(
				"Un registro de fibra no puede tener limpiado y predescerdado a la vez",
			)
		}
	}
}

function validateGroomingWeights(
	commonRecord: CleaningCommonData,
	detail: GroomingData,
): void {
	const { grossWeight } = commonRecord
	const { cleanWeight, dirtyWeight, totalWeight } = detail

	if (
		![cleanWeight, dirtyWeight, totalWeight].every(isPositiveFiniteNumber)
	) {
		throw new PermitValidationError("Los pesos del limpiado no son válidos")
	}

	const grossWeightDecimal = new Decimal(grossWeight)
	const cleanWeightDecimal = new Decimal(cleanWeight)
	const dirtyWeightDecimal = new Decimal(dirtyWeight)
	const calculatedTotal = cleanWeightDecimal.plus(dirtyWeightDecimal)

	if (cleanWeightDecimal.greaterThan(grossWeightDecimal)) {
		throw new PermitValidationError(
			"El peso del vellón limpio no puede superar el peso bruto",
		)
	}
	if (dirtyWeightDecimal.greaterThan(grossWeightDecimal)) {
		throw new PermitValidationError(
			"El peso braga no puede superar el peso bruto",
		)
	}
	if (calculatedTotal.greaterThan(grossWeightDecimal)) {
		throw new PermitValidationError(
			"La suma de los pesos del limpiado no puede superar el peso bruto",
		)
	}
	if (!calculatedTotal.equals(totalWeight)) {
		throw new PermitValidationError(
			"El peso total de la fibra no coincide con los pesos del limpiado",
		)
	}
}

function isPositiveFiniteNumber(value: number): boolean {
	return Number.isFinite(value) && value > 0
}

function ensureUniqueIds(ids: string[], label: string): void {
	const uniqueIds = new Set(ids)

	if (uniqueIds.size !== ids.length) {
		throw new PermitValidationError(
			`${label} está duplicado en los datos enviados`,
		)
	}
}
