import { create } from "zustand"

export type MessageType = "success" | "info" | "error"

type AppMessage = {
	type: MessageType
	text: string
}

type MessageState = {
	message: AppMessage | null
	showMessage: (type: MessageType, text: string) => void
	dismissMessage: () => void
}

export const useMessageStore = create<MessageState>((set) => ({
	message: null,
	showMessage: (type, text) => set({ message: { type, text } }),
	dismissMessage: () => set({ message: null }),
}))
