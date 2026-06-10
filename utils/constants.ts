export const ROUTES = {
	HOME: "/",
	OVERVIEW: (permitId: string) => ({
		pathname: "/[permitId]" as const,
		params: { permitId },
	}),
	BASIC_INFO: (permitId: string) => ({
		pathname: "/[permitId]/basic-info" as const,
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
	},
}
