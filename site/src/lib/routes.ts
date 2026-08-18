export const routes = {
	home: {
		es: "/es/",
		en: "/en/",
	},
	fiber: {
		es: "/es/fibra-de-vicuna/",
		en: "/en/vicuna-fiber/",
	},
	organization: {
		es: "/es/anmvb/",
		en: "/en/anmvb/",
	},
	contact: {
		es: "/es/contacto-comercial/",
		en: "/en/commercial-contact/",
	},
} as const

export type Language = "es" | "en"
export type RouteName = keyof typeof routes
