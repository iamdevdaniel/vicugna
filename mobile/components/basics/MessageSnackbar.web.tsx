import { Notification } from "@mantine/core"
import { type MessageType, useMessageStore } from "@utils/message-store.web"
import { useEffect } from "react"

const messageAppearance: Record<MessageType, { color: string; title: string }> =
	{
		success: { color: "green", title: "Listo" },
		info: { color: "blue", title: "Información" },
		error: { color: "red", title: "Ocurrió un problema" },
	}

export function MessageSnackbar() {
	const message = useMessageStore((state) => state.message)
	const dismissMessage = useMessageStore((state) => state.dismissMessage)

	useEffect(() => {
		if (!message) return

		const timeout = window.setTimeout(dismissMessage, 5_000)
		return () => window.clearTimeout(timeout)
	}, [dismissMessage, message])

	if (!message) return null

	const appearance = messageAppearance[message.type]
	return (
		<Notification
			aria-live={message.type === "error" ? "assertive" : "polite"}
			color={appearance.color}
			onClose={dismissMessage}
			style={snackbarStyle}
			title={appearance.title}
			withBorder
		>
			{message.text}
		</Notification>
	)
}

const snackbarStyle = {
	bottom: "1.5rem",
	left: "50%",
	maxWidth: "calc(100vw - 2rem)",
	position: "fixed" as const,
	transform: "translateX(-50%)",
	width: 420,
	zIndex: 1000,
}
