import AsyncStorage from "@react-native-async-storage/async-storage"
import { useColorScheme } from "react-native"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

type ThemeMode = "system" | "light" | "dark"

type SettingsState = {
	themeMode: ThemeMode
	setThemeMode: (themeMode: ThemeMode) => void
}

export const useSettingsStore = create<SettingsState>()(
	persist(
		(set) => ({
			themeMode: "system",
			setThemeMode: (themeMode) => set({ themeMode }),
		}),
		{
			name: "vicugna-mobile-settings",
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state) => ({ themeMode: state.themeMode }),
		},
	),
)

export function useActiveThemeMode(): "light" | "dark" {
	const systemMode = useColorScheme()
	const themeMode = useSettingsStore((state) => state.themeMode)

	if (themeMode !== "system") return themeMode

	return systemMode === "light" ? "light" : "dark"
}
