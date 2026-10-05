import { BackupPanel } from "@components/backup/BackupPanel.web"
import { Drawer } from "@mantine/core"

type SettingsDrawerProps = {
	opened: boolean
	onClose: () => void
}

export function SettingsDrawer({ opened, onClose }: SettingsDrawerProps) {
	return (
		<Drawer
			opened={opened}
			onClose={onClose}
			keepMounted
			title="Configuración"
			position="right"
			size="lg"
			overlayProps={{ backgroundOpacity: 0.55, blur: 2 }}
		>
			<BackupPanel />
		</Drawer>
	)
}
