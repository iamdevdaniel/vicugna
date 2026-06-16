export type DbState<T> = { data: T; loading: boolean; error: Error | null }

type DbAction<T> =
	| { type: "success"; data: T }
	| { type: "error"; error: Error }

// TODO: decide one app-wide pattern for surfacing read/write errors to users.
export function makeReadInitial<T>(data: T): DbState<T> {
	return { data, loading: true, error: null }
}

export function readReducer<T>(
	state: DbState<T>,
	action: DbAction<T>,
): DbState<T> {
	switch (action.type) {
		case "success":
			return { data: action.data, loading: false, error: null }
		case "error":
			return { ...state, loading: false, error: action.error }
	}
}
