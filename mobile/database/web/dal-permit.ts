import type { PermitData } from "@definitions/types"
import { liveQuery } from "dexie"
import { getWebDatabase } from "./setup"

type SubscriptionCallbacks<T> = {
	onChange: (data: T) => void
	onError: (error: Error) => void
}

export function subscribePermits(
	accountId: string,
	callbacks: SubscriptionCallbacks<PermitData[]>,
): () => void {
	const database = getWebDatabase(accountId)
	const subscription = liveQuery(() =>
		database.permits.orderBy("permitNumber").toArray(),
	).subscribe({
		next: callbacks.onChange,
		error: (error) => callbacks.onError(error as Error),
	})

	return () => subscription.unsubscribe()
}

export function subscribeSinglePermit(
	accountId: string,
	permitId: string,
	callbacks: SubscriptionCallbacks<PermitData | null>,
): () => void {
	const database = getWebDatabase(accountId)
	const subscription = liveQuery(
		async () => (await database.permits.get(permitId)) ?? null,
	).subscribe({
		next: callbacks.onChange,
		error: (error) => callbacks.onError(error as Error),
	})

	return () => subscription.unsubscribe()
}
