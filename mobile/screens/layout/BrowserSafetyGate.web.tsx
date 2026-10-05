import { type BrowserPersistenceStatus, BrowserSafetyContext } from "@hooks/web"
import { Alert, Center, Loader, Stack, Text, Title } from "@mantine/core"
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react"

export function BrowserSafetyGate({ children }: { children: ReactNode }) {
	const [writerStatus, setWriterStatus] = useState<
		"checking" | "ready" | "blocked" | "unsupported" | "error"
	>("checking")
	const [persistenceStatus, setPersistenceStatus] =
		useState<BrowserPersistenceStatus>("checking")
	const releaseLock = useRef<(() => void) | undefined>(undefined)

	useEffect(() => {
		let active = true
		if (!navigator.locks) {
			setWriterStatus("unsupported")
			return
		}

		void navigator.locks
			.request(
				"vicugna-field-writer",
				{ ifAvailable: true, mode: "exclusive" },
				async (lock) => {
					if (!active) return
					if (!lock) {
						setWriterStatus("blocked")
						return
					}

					setWriterStatus("ready")
					await new Promise<void>((resolve) => {
						releaseLock.current = resolve
					})
				},
			)
			.catch(() => {
				if (active) setWriterStatus("error")
			})

		return () => {
			active = false
			releaseLock.current?.()
			releaseLock.current = undefined
		}
	}, [])

	const requestPersistence = useCallback(async () => {
		if (!navigator.storage?.persist) {
			setPersistenceStatus("unsupported")
			return "unsupported" as const
		}

		try {
			const granted = await navigator.storage.persist()
			const status = granted ? "granted" : "denied"
			setPersistenceStatus(status)
			return status
		} catch {
			setPersistenceStatus("denied")
			return "denied" as const
		}
	}, [])

	useEffect(() => {
		const checkPersistence = async () => {
			if (!navigator.storage?.persisted || !navigator.storage.persist) {
				setPersistenceStatus("unsupported")
				return
			}

			try {
				const granted = await navigator.storage.persisted()
				setPersistenceStatus(granted ? "granted" : "denied")
			} catch {
				setPersistenceStatus("denied")
			}
		}

		void checkPersistence()
	}, [])

	if (writerStatus === "checking") {
		return (
			<Center h="100vh">
				<Loader />
			</Center>
		)
	}

	if (writerStatus !== "ready") {
		return (
			<Center h="100vh" p="md">
				<Stack maw={560}>
					<Title order={1}>
						{writerStatus === "blocked"
							? "La aplicación ya está abierta"
							: "No se puede iniciar de forma segura"}
					</Title>
					<Alert color="red">
						{writerStatus === "blocked"
							? "Vicugna ya está abierta en otra ventana. Cierre esta ventana y continúe usando la que ya estaba abierta."
							: "Este navegador no permite proteger la base de datos contra dos ventanas abiertas."}
					</Alert>
					{writerStatus !== "blocked" && (
						<Text c="dimmed">
							Mantener una sola ventana evita escrituras
							simultáneas sobre los datos locales.
						</Text>
					)}
				</Stack>
			</Center>
		)
	}

	return (
		<BrowserSafetyContext.Provider
			value={{ persistenceStatus, requestPersistence }}
		>
			{children}
		</BrowserSafetyContext.Provider>
	)
}
