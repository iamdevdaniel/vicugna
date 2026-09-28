import "@mantine/core/styles.css"
import "../../assets/styles/web.css"

import { MessageSnackbar } from "@components/basics/MessageSnackbar.web"
import { MantineProvider } from "@mantine/core"
import {
	webColorSchemeManager,
	webCssVariablesResolver,
	webTheme,
} from "@utils/web-theme.web"
import { Slot } from "expo-router"

export default function WebAppLayout() {
	return (
		<MantineProvider
			theme={webTheme}
			cssVariablesResolver={webCssVariablesResolver}
			colorSchemeManager={webColorSchemeManager}
			defaultColorScheme="light"
		>
			<Slot />
			<MessageSnackbar />
		</MantineProvider>
	)
}
