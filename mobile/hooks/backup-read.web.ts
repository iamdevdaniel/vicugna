import {
	subscribeBackupSettings,
	type WebBackupSettingsRecord,
} from "@database/web"
import { useMobileAuthStore } from "@utils/auth-store.web"
import { useEffect, useState } from "react"

export function useBackupSettings() {
	const [settings, setSettings] = useState<WebBackupSettingsRecord | null>(
		null,
	)
	const [settingsLoaded, setSettingsLoaded] = useState(false)
	const accountId = useMobileAuthStore((state) => state.user?.id)

	useEffect(() => {
		if (!accountId) {
			setSettings(null)
			setSettingsLoaded(true)
			return
		}

		setSettingsLoaded(false)
		return subscribeBackupSettings(accountId, {
			onChange: (value) => {
				setSettings(value)
				setSettingsLoaded(true)
			},
			onError: () => {
				setSettings(null)
				setSettingsLoaded(true)
			},
		})
	}, [accountId])

	return { settings, settingsLoaded }
}
