import { DatabaseError } from "pg"

export const POSTGRES_ERROR_CODES = {
	uniqueViolation: "23505",
	foreignKeyViolation: "23503",
	notNullViolation: "23502",
	checkViolation: "23514",
} as const

type PostgresErrorCode =
	(typeof POSTGRES_ERROR_CODES)[keyof typeof POSTGRES_ERROR_CODES]

export function getPostgresConstraintName(
	error: unknown,
	code: PostgresErrorCode,
): string | null {
	if (!(error instanceof Error) || !(error.cause instanceof DatabaseError)) {
		return null
	}

	if (error.cause.code !== code) {
		return null
	}

	return error.cause.constraint ?? null
}
