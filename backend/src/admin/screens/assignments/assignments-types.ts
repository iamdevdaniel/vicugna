export type AssignmentActionData =
	| {
			ok: true
			intent: "create-permit"
			message: string
			permitId: string
	  }
	| {
			ok: true
			intent: "rename-permit" | "save-assignments"
			message: string
	  }
	| { ok: false; intent: string; message: string }
