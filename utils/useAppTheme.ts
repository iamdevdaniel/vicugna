import { type MD3Theme, useTheme } from "react-native-paper"

export type AppTheme = MD3Theme & {
	colors: MD3Theme["colors"] & {
		custom: {
			green: string
			crimson: string
			yellow: string
			blue: string
		}
	}
}

export const useAppTheme = () => useTheme<AppTheme>()
