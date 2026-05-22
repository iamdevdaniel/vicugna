export type DbState<T> = { data: T; loading: boolean; error: Error | null }
export type DbAction<T> =
	| { type: "success"; data: T }
	| { type: "error"; error: Error }

export function makeReducer<T>() {
	return (state: DbState<T>, action: DbAction<T>): DbState<T> => {
		switch (action.type) {
			case "success":
				return { data: action.data, loading: false, error: null }
			case "error":
				return { ...state, loading: false, error: action.error }
		}
	}
}

export function makeInitial<T>(initial: T): DbState<T> {
	return { data: initial, loading: true, error: null }
}
