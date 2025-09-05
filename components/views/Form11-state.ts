import type { WoolFormData } from "@types"
import { create } from "zustand"

const initialFormState: WoolFormData = {
	ficha: "",
	pesoFibraBruto: 0,
	pesoVellonLimpio: 0,
	pesoBraga: 0,
	pesoTotalFibra: 0,
	pesoFibraPredescerdada: 0,
	pesoCerda: 0,
	caspa: "",
	nombrePredescerdador: "",
}

type FormState = {
	data: WoolFormData
	isDirty: boolean
	showFade: boolean
}

type FormActions = {
	setField: <K extends keyof WoolFormData>(
		key: K,
		value: WoolFormData[K],
	) => void
	reset: () => void
	setDirty: (dirty: boolean) => void
	setShowFade: (show: boolean) => void
}

type FormStore = FormState & FormActions

export const useFormStore = create<FormStore>((set) => ({
	data: { ...initialFormState },
	isDirty: false,
	showFade: true,
	setField: (key, value) =>
		set((state) => ({
			data: { ...state.data, [key]: value },
			isDirty: true,
		})),
	reset: () =>
		set(() => ({
			data: { ...initialFormState },
			isDirty: false,
		})),
	setDirty: (dirty) => set(() => ({ isDirty: dirty })),
	setShowFade: (show) => set(() => ({ showFade: show })),
}))
