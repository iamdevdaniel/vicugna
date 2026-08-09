import { getMobileUserFromAuthorization } from "../mobile-auth/mobile_auth.service"
import { PermitValidationError } from "./mobile_in.errors"
import { saveSyncFieldData } from "./mobile_in.repository"
import type { SyncFieldData } from "./mobile_in.types"

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
	}
}

function validateCleaning(data: SyncFieldData): void {
	if (!data.cleaningHeader) {
		throw new PermitValidationError(
			"La cabecera de limpieza es obligatoria",
		)
	}

	if (data.cleaningHeader.permitId !== data.permit.id) {
		throw new PermitValidationError(
			"La cabecera de limpieza no pertenece al permiso",
		)
	}

	if (!data.cleaningCommonRecords.length) {
		throw new PermitValidationError("No hay registros de limpieza")
	}

	if (
		data.groomingDetails.length + data.dehearingDetails.length !==
		data.cleaningCommonRecords.length
	) {
		throw new PermitValidationError(
			"Cada registro de limpieza debe tener un detalle",
		)
	}

	ensureUniqueIds(
		data.cleaningCommonRecords.map((record) => record.id),
		"El registro de limpieza",
	)
	ensureUniqueIds(
		data.groomingDetails.map((detail) => detail.cleaningCommonId),
		"La relación de descerdado",
	)
	ensureUniqueIds(
		data.groomingDetails.map((detail) => detail.id),
		"El detalle de descerdado",
	)
	ensureUniqueIds(
		data.dehearingDetails.map((detail) => detail.cleaningCommonId),
		"La relación de depilado",
	)
	ensureUniqueIds(
		data.dehearingDetails.map((detail) => detail.id),
		"El detalle de depilado",
	)

	for (const record of data.cleaningCommonRecords) {
		if (record.permitId !== data.permit.id) {
			throw new PermitValidationError(
				"El registro de limpieza no pertenece al permiso",
			)
		}
	}

	const cleaningCommonIds = new Set(
		data.cleaningCommonRecords.map((record) => record.id),
	)
	const usedDetailIds = new Set<string>()

	for (const detail of data.groomingDetails) {
		if (!cleaningCommonIds.has(detail.cleaningCommonId)) {
			throw new PermitValidationError(
				"El detalle de descerdado no pertenece al registro de limpieza",
			)
		}

		usedDetailIds.add(detail.cleaningCommonId)
	}

	for (const detail of data.dehearingDetails) {
		if (!cleaningCommonIds.has(detail.cleaningCommonId)) {
			throw new PermitValidationError(
				"El detalle de depilado no pertenece al registro de limpieza",
			)
		}

		if (usedDetailIds.has(detail.cleaningCommonId)) {
			throw new PermitValidationError(
				"Un registro de limpieza no puede tener descerdado y depilado a la vez",
			)
		}
	}
}

function ensureUniqueIds(ids: string[], label: string): void {
	const uniqueIds = new Set(ids)

	if (uniqueIds.size !== ids.length) {
		throw new PermitValidationError(
			`${label} está duplicado en los datos enviados`,
		)
	}
}
