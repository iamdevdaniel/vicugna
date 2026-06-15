import { type MD3Theme, useTheme } from "react-native-paper"

export type AppTheme = MD3Theme & {
	colors: MD3Theme["colors"] & {
		custom: {
			green: string
			crimson: string
			yellow: string
			blue: string
			lightGray: string
			darkGray: string
			white: string
			pink: string
			pastelGreen: string
			pastelBlue: string
			pastelYellow: string
		}
	}
}

export const useAppTheme = () => useTheme<AppTheme>()
