import { SyncStage } from "@definitions/enums"
import type {
	Form11Dehearing,
	Form11Shearing,
	Form11Storage,
} from "@definitions/types"
import type {
	Form11ShearingModel,
	Form11StorageModel,
	SyncMetaModel,
} from "./models"
import { database } from "./setup"

export async function createShearingForm(
	shearingData: Form11Shearing,
): Promise<void> {
	await database.write(async () => {
		const shearing = await database
			.get<Form11ShearingModel>("form11_shearing")
			.create((model: Form11ShearingModel) => {
				model.departamento = shearingData.departamento
				model.asociacionRegional = shearingData.asociacionRegional
				model.comunidadManejadora = shearingData.comunidadManejadora
				model.sitioCaptura = shearingData.sitioCaptura
				model.fechaCaptura = shearingData.fechaCaptura
				model.codigoAutorizacion = shearingData.codigoAutorizacion
			})

		const sync = await database
			.get<SyncMetaModel>("sync_meta")
			.create((model: SyncMetaModel) => {
				model.stage = "unsynced"
				model.timestamp = Date.now()
			})

		await database
			.get<Form11StorageModel>("form11_storage")
			.create((model: Form11StorageModel) => {
				model.sync = sync.id
				model.shearingId = shearing.id
				model.dehearingId = ""
			})
	})
}

const modelToStageType = (stage: string): SyncStage => {
	switch (stage) {
		case "synced":
			return SyncStage.Synced
		case "failed":
			return SyncStage.Failed
		default:
			return SyncStage.Unsynced
	}
}

export async function readShearingForm(
	storageId: string,
): Promise<Form11Storage> {
	const storage = await database
		.get<Form11StorageModel>("form11_storage")
		.find(storageId)
	const shearing = await database
		.get<Form11ShearingModel>("form11_shearing")
		.find(storage.shearingId)
	const sync = await database
		.get<SyncMetaModel>("sync_meta")
		.find(storage.sync)

	return {
		id: storage.id,
		sync: {
			stage: modelToStageType(sync.stage),
			timestamp: sync.timestamp,
			errorMessage: sync.errorMessage,
		},
		shearing: {
			id: shearing.id,
			departamento: shearing.departamento,
			asociacionRegional: shearing.asociacionRegional,
			comunidadManejadora: shearing.comunidadManejadora,
			sitioCaptura: shearing.sitioCaptura,
			fechaCaptura: shearing.fechaCaptura,
			codigoAutorizacion: shearing.codigoAutorizacion,
		},
		dehearing: {} as Form11Dehearing,
		records: [],
	}
}

export async function readAllShearingForms(): Promise<Form11Storage[]> {
	const storages = await database
		.get<Form11StorageModel>("form11_storage")
		.query()
		.fetch()
	return Promise.all(storages.map((storage) => readShearingForm(storage.id)))
}
