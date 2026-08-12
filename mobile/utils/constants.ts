type PermitRouteParams = {
	permitId: string
	permitNumber: string
}

export const ROUTES = {
	HOME: "/",
	LOGIN: "/login",
	OVERVIEW: ({ permitId, permitNumber }: PermitRouteParams) => ({
		pathname: "/[permitId]" as const,
		params: { permitId, permitNumber },
	}),
	PARTICIPANTS: {
		OVERVIEW: ({ permitId, permitNumber }: PermitRouteParams) => ({
			pathname: "/[permitId]/participants" as const,
			params: { permitId, permitNumber },
		}),
		FORM: (
			permitId: string,
			permitNumber: string,
			participantId: string,
		) => ({
			pathname: "/[permitId]/participants/[participantId]" as const,
			params: { permitId, permitNumber, participantId },
		}),
	},
	SHEARING: {
		OVERVIEW: ({ permitId, permitNumber }: PermitRouteParams) => ({
			pathname: "/[permitId]/shearing" as const,
			params: { permitId, permitNumber },
		}),
		HEADER: (permitId: string, permitNumber: string) => ({
			pathname: "/[permitId]/shearing/header" as const,
			params: { permitId, permitNumber },
		}),
		RECORD: (
			permitId: string,
			permitNumber: string,
			recordId?: string,
		) => ({
			pathname: "/[permitId]/shearing/record" as const,
			params: {
				permitId,
				permitNumber,
				...(recordId ? { recordId } : {}),
			},
		}),
	},
	CLEANUP: {
		OVERVIEW: ({ permitId, permitNumber }: PermitRouteParams) => ({
			pathname: "/[permitId]/cleanup" as const,
			params: { permitId, permitNumber },
		}),
		HEADER: (permitId: string, permitNumber: string) => ({
			pathname: "/[permitId]/cleanup/header" as const,
			params: { permitId, permitNumber },
		}),
		RECORD: (
			permitId: string,
			permitNumber: string,
			recordId?: string,
		) => ({
			pathname: "/[permitId]/cleanup/record" as const,
			params: {
				permitId,
				permitNumber,
				...(recordId ? { recordId } : {}),
			},
		}),
	},
} as const
