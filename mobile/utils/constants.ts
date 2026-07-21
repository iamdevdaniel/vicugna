export const ROUTES = {
	HOME: "/",
	LOGIN: "/login",
	OVERVIEW: (permitId: string) => ({
		pathname: "/[permitId]" as const,
		params: { permitId },
	}),
	PARTICIPANTS: {
		OVERVIEW: (permitId: string) => ({
			pathname: "/[permitId]/participants" as const,
			params: { permitId },
		}),
		FORM: (permitId: string, participantId: string) => ({
			pathname: "/[permitId]/participants/[participantId]" as const,
			params: { permitId, participantId },
		}),
	},
	SHEARING: {
		OVERVIEW: (permitId: string) => ({
			pathname: "/[permitId]/shearing" as const,
			params: { permitId },
		}),
		HEADER: (permitId: string) => ({
			pathname: "/[permitId]/shearing/header" as const,
			params: { permitId },
		}),
		RECORD: (permitId: string, recordId?: string) => ({
			pathname: "/[permitId]/shearing/record" as const,
			params: { permitId, ...(recordId ? { recordId } : {}) },
		}),
	},
	CLEANUP: {
		OVERVIEW: (permitId: string) => ({
			pathname: "/[permitId]/cleanup" as const,
			params: { permitId },
		}),
		HEADER: (permitId: string) => ({
			pathname: "/[permitId]/cleanup/header" as const,
			params: { permitId },
		}),
		RECORD: (permitId: string, recordId?: string) => ({
			pathname: "/[permitId]/cleanup/record" as const,
			params: { permitId, ...(recordId ? { recordId } : {}) },
		}),
		DETAILS: (permitId: string, recordId: string) => ({
			pathname: "/[permitId]/cleanup/details" as const,
			params: { permitId, recordId },
		}),
	},
} as const
