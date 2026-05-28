import type { ShearingHeader, ShearingHeaderFormData } from "@definitions/types"
import { Q } from "@nozbe/watermelondb"
import { useEffect, useReducer } from "react"
import { applyShearingHeaderToModel, mapToShearingHeader } from "./mappers"
import type { ShearingHeaderModel } from "./models"
import { database } from "./setup"
import { type DbState, makeInitial, makeReducer } from "./utils-db"

//-------------------READ-------------------

export function useReadShearingHeader(
	permitId: string,
): DbState<ShearingHeader | null> {
	const [state, dispatch] = useReducer(
		makeReducer<ShearingHeader | null>(),
		makeInitial<ShearingHeader | null>(null),
	)

	useEffect(() => {
		const sub = database
			.get<ShearingHeaderModel>("shearingHeader")
			.query(Q.where("permitId", permitId))
			.observeWithColumns([
				"site",
				"latitude",
				"longitude",
				"roundupCount",
				"startTime",
				"endTime",
				"isCompleted",
			])
			.subscribe({
				next: (records) =>
					dispatch({
						type: "success",
						data: records[0]
							? mapToShearingHeader(records[0])
							: null,
					}),
				error: (e) => dispatch({ type: "error", error: e as Error }),
			})
		return () => sub.unsubscribe()
	}, [permitId])

	return state
}

//-------------------WRITE-------------------

export async function updateShearingHeader(
	id: string,
	data: ShearingHeaderFormData,
): Promise<void> {
	await database.write(async () => {
		const record = await database
			.get<ShearingHeaderModel>("shearingHeader")
			.find(id)
		await record.update((model) =>
			applyShearingHeaderToModel(model, data, true),
		)
	})
}
