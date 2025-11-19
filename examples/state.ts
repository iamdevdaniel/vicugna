// import type { Form11Data } from "@types"
// import { create } from "zustand"

// const initialFormState: Form11Data = {
//     ficha: "",
//     pesoFibraBruto: "",
//     pesoVellonLimpio: "",
//     pesoBraga: "",
//     pesoTotalFibra: "",
//     pesoFibraPredescerdada: "",
//     pesoCerda: "",
//     caspa: "NO",
//     nombrePredescerdador: "",
// }

// type FormState = {
// 	data: Form11Data
// 	isDirty: boolean
// 	showFade: boolean
// }

// type FormActions = {
// 	setField: <K extends keyof Form11Data>(
// 		key: K,
// 		value: Form11Data[K],
// 	) => void
// 	reset: () => void
// 	setDirty: (dirty: boolean) => void
// 	setShowFade: (show: boolean) => void
// }

// type FormStore = FormState & FormActions

// export const useFormStore = create<FormStore>((set) => ({
// 	data: { ...initialFormState },
// 	isDirty: false,
// 	showFade: true,
// 	setField: (key, value) =>
// 		set((state) => ({
// 			data: { ...state.data, [key]: value },
// 			isDirty: true,
// 		})),
// 	reset: () =>
// 		set(() => ({
// 			data: { ...initialFormState },
// 			isDirty: false,
// 		})),
// 	setDirty: (dirty) => set(() => ({ isDirty: dirty })),
// 	setShowFade: (show) => set(() => ({ showFade: show })),
// }))
