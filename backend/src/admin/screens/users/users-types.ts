export type UsersActionData =
	| { ok: true; successMessage: string }
	| { ok: false; errorMessage: string }
