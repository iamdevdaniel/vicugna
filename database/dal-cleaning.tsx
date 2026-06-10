import type { CleaningHeader, CleaningHeaderFormData } from "@definitions/types"
import { Q } from "@nozbe/watermelondb"
import { applyCleaningHeaderToModel, mapToCleaningHeader } from "./mappers"
import type { CleaningHeaderModel } from "./models"
import { database } from "./setup"

type SubscriptionCallback<T> = {
	onChange: (data: T) => void
	onError: (error: Error) => void
}

//-------------------READ-------------------

export function subscribeSingleCleaningHeader(
	permitId: string,
	callbacks: SubscriptionCallback<CleaningHeader | null>,
): () => void {
	const sub = database
		.get<CleaningHeaderModel>("cleaningHeader")
		.query(Q.where("permitId", permitId))
		.observeWithColumns([
			"startDate",
			"endDate",
			"site",
			"supervisors",
			"isCompleted",
		])
		.subscribe({
			next: (records) =>
				callbacks.onChange(
					records[0] ? mapToCleaningHeader(records[0]) : null,
				),
			error: (e) => callbacks.onError(e as Error),
		})

	return () => sub.unsubscribe()
}

//-------------------WRITE-------------------

export async function updateSingleCleaningHeader(
	headerId: string,
	data: CleaningHeaderFormData,
): Promise<void> {
	await database.write(async () => {
		const record = await database
			.get<CleaningHeaderModel>("cleaningHeader")
			.find(headerId)
		await record.update((model) =>
			applyCleaningHeaderToModel(model, data, true),
		)
	})
}
