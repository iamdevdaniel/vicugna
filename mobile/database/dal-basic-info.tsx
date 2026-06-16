import type { BasicInfoData, BasicInfoFormData } from "@definitions/types"
import { Q } from "@nozbe/watermelondb"
import { applyBasicInfoToModel, mapToBasicInfo } from "./mappers"
import type { BasicInfoModel } from "./models"
import { database } from "./setup"

type SubscriptionCallback<T> = {
	onChange: (data: T) => void
	onError: (error: Error) => void
}

//-------------------READ-------------------

export function subscribeSingleBasicInfo(
	permitId: string,
	callbacks: SubscriptionCallback<BasicInfoData | null>,
): () => void {
	const sub = database
		.get<BasicInfoModel>("basicInfo")
		.query(Q.where("permitId", permitId))
		.observeWithColumns([
			"department",
			"regional",
			"community",
			"site",
			"date",
			"isCompleted",
		])
		.subscribe({
			next: (records) =>
				callbacks.onChange(
					records[0] ? mapToBasicInfo(records[0]) : null,
				),
			error: (e) => callbacks.onError(e as Error),
		})

	return () => sub.unsubscribe()
}

//-------------------WRITE-------------------

export async function createSingleBasicInfo(
	permitId: string,
): Promise<BasicInfoData> {
	let record: BasicInfoModel | undefined
	await database.write(async () => {
		record = await database
			.get<BasicInfoModel>("basicInfo")
			.create((model) => {
				model.permitId = permitId
				model.department = ""
				model.regional = ""
				model.community = ""
				model.site = ""
				model.date = ""
				model.isCompleted = false
			})
	})
	if (!record) throw new Error("No se pudo crear el registro de info básica.")
	return mapToBasicInfo(record)
}

export async function updateSingleBasicInfo(
	basicInfoId: string,
	data: BasicInfoFormData,
): Promise<void> {
	await database.write(async () => {
		const record = await database
			.get<BasicInfoModel>("basicInfo")
			.find(basicInfoId)
		await record.update((model) => applyBasicInfoToModel(model, data, true))
	})
}
