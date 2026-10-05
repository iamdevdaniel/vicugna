import {
	type BackupWritableFile,
	useBackupActions,
	useBackupSettings,
	useBrowserPersistenceStatus,
	useRequestBrowserPersistence,
} from "@hooks/web"
import { Alert, Button, Group, Paper, Stack, Text, Title } from "@mantine/core"
import { useMobileAuthStore } from "@utils/auth-store.web"
import { useMessageStore } from "@utils/message-store.web"

type FilePickerWindow = Window &
	typeof globalThis & {
		showOpenFilePicker?: (options: {
			excludeAcceptAllOption: boolean
			multiple: boolean
			types: Array<{
				description: string
				accept: Record<string, string[]>
			}>
		}) => Promise<BackupWritableFile[]>
		showSaveFilePicker?: (options: {
			suggestedName: string
			types: Array<{
				description: string
				accept: Record<string, string[]>
			}>
		}) => Promise<BackupWritableFile>
	}

const pickerOptions = {
	description: "Copia de Vicugna",
	accept: { "application/json": [".vicugna"] },
}

export function BackupPanel() {
	const persistenceStatus = useBrowserPersistenceStatus()
	const requestPersistence = useRequestBrowserPersistence()
	const accountId = useMobileAuthStore((state) => state.user?.id)
	const showMessage = useMessageStore((state) => state.showMessage)
	const { configureBackup, retryBackup, restoreBackup, working } =
		useBackupActions()
	const { settings, settingsLoaded } = useBackupSettings()
	const filePickerWindow = window as FilePickerWindow
	const fileAccessSupported = Boolean(
		filePickerWindow.showOpenFilePicker &&
			filePickerWindow.showSaveFilePicker,
	)

	const selectBackupFile = async () => {
		if (!filePickerWindow.showSaveFilePicker || !accountId) return
		try {
			const persistenceRequest = requestPersistence()
			const handleRequest = filePickerWindow.showSaveFilePicker({
				suggestedName: `vicugna-${accountId}-actual.vicugna`,
				types: [pickerOptions],
			})
			const [, handle] = await Promise.all([
				persistenceRequest,
				handleRequest,
			])
			const result = await configureBackup(handle)
			if ("cancelled" in result) return
			showMessage(
				result.ok ? "success" : "error",
				result.ok ? "Copia automática configurada" : result.error,
			)
		} catch (error) {
			if (!isPickerCancellation(error)) {
				showMessage(
					"error",
					"No se pudo seleccionar el archivo de copia",
				)
			}
		}
	}

	const retry = async () => {
		const result = await retryBackup()
		if ("cancelled" in result) return
		showMessage(
			result.ok ? "success" : "error",
			result.ok ? "Copia actualizada" : result.error,
		)
	}

	const beginRestore = async () => {
		if (!filePickerWindow.showOpenFilePicker) return
		try {
			const [handle] = await filePickerWindow.showOpenFilePicker({
				excludeAcceptAllOption: true,
				multiple: false,
				types: [pickerOptions],
			})
			if (
				!window.confirm("¿Reemplazar los datos locales con esta copia?")
			) {
				return
			}

			const result = await restoreBackup(handle)
			if ("cancelled" in result) return
			showMessage(
				result.ok ? "success" : "error",
				result.ok ? "Copia restaurada" : result.error,
			)
		} catch (error) {
			if (!isPickerCancellation(error)) {
				showMessage("error", "No se pudo abrir la copia")
			}
		}
	}

	return (
		<Paper withBorder p="md">
			<Stack gap="sm">
				<div>
					<Title order={2} size="h4">
						Copia externa
					</Title>
					<Text size="sm" c="dimmed">
						Se actualiza después de cada guardado y sobrevive si se
						borran los datos de Chrome.
					</Text>
				</div>
				{persistenceStatus === "denied" ||
				persistenceStatus === "unsupported" ? (
					<Alert color="yellow">
						Chrome podría borrar los datos locales si necesita
						liberar espacio.
					</Alert>
				) : persistenceStatus === "granted" ? (
					<Alert color="green">
						Chrome protegió los datos locales contra la limpieza
						automática.
					</Alert>
				) : null}

				{!fileAccessSupported ? (
					<Alert color="red">
						Este navegador no permite mantener la copia automática.
						Use Chrome o Edge actualizado.
					</Alert>
				) : !settingsLoaded ? null : !settings ? (
					<Alert color="yellow">
						Elija dónde guardar la copia de seguridad antes de
						comenzar.
					</Alert>
				) : settings.status === "pending" ? (
					<Alert color="yellow">
						Los datos locales están guardados, pero la copia externa
						está pendiente.
					</Alert>
				) : (
					<Alert color="green">Copia de seguridad actualizada.</Alert>
				)}

				{fileAccessSupported ? (
					<Group>
						<Button
							variant="light"
							onClick={() => void selectBackupFile()}
							disabled={working}
						>
							{settings
								? "Cambiar ubicación"
								: "Seleccionar ubicación"}
						</Button>
						{settings?.status === "pending" ? (
							<Button
								onClick={() => void retry()}
								loading={working}
							>
								Reintentar copia
							</Button>
						) : null}
						<Button
							variant="outline"
							onClick={() => void beginRestore()}
							disabled={working}
						>
							Restaurar copia
						</Button>
					</Group>
				) : null}
			</Stack>
		</Paper>
	)
}

function isPickerCancellation(error: unknown): boolean {
	return error instanceof DOMException && error.name === "AbortError"
}
