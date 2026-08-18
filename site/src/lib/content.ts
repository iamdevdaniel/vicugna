import type { Language, RouteName } from "./routes"

const images = {
	portrait: "/images/01.webp",
	landscape: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Vicu%C3%B1a_en_Chile.jpg",
	grass: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Vicuna_standing_in_grass_-_DPLA_-_690a7a2a88b0ee8121a1f0bdebe8b3c3.jpg",
} as const

const lorem =
	"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."

export const commonContent = {
	es: {
		navigation: { home: "Inicio", fiber: "Fibra de vicuña", organization: "ANMVB", contact: "Contacto" },
		languageLabel: "Idioma",
		footerTitle: "Fibra boliviana. Origen comunitario.",
		footerText: "Asociación Nacional de Manejadores de Vicuña de Bolivia",
		footerRights:
			"© 2026 ANMVB. Todos los derechos reservados. Las fotografías no pueden reproducirse ni utilizarse sin autorización previa por escrito.",
		imageAlt: "Vicuña en un paisaje altoandino",
	},
	en: {
		navigation: { home: "Home", fiber: "Vicuña fiber", organization: "ANMVB", contact: "Contact" },
		languageLabel: "Language",
		footerTitle: "Bolivian fiber. Community origin.",
		footerText: "National Association of Vicuña Management Communities of Bolivia",
		footerRights:
			"© 2026 ANMVB. All rights reserved. Photographs may not be reproduced or used without prior written permission.",
		imageAlt: "Vicuña in a high-Andean landscape",
	},
} as const

export const homeContent = {
	es: {
		pageTitle: "Inicio",
		eyebrow: "Fibra de origen boliviano",
		title: "La fibra más fina de los Andes, manejada por sus comunidades.",
		subtitle: "ANMVB reúne a comunidades que conservan la vicuña y comercializan su fibra de manera organizada.",
		primaryAction: "Conocer la fibra",
		secondaryAction: "Contacto comercial",
		introEyebrow: "Origen y propósito",
		introTitle: "Una cadena de valor que nace en el territorio",
		introSubtitle: "Conservación, manejo comunitario y calidad para compradores que valoran un origen responsable.",
		introBody: lorem,
		values: [
			{ title: "Origen trazable", subtitle: "Fibra vinculada a comunidades y territorios productores.", body: lorem },
			{ title: "Manejo responsable", subtitle: "Aprovechamiento compatible con la conservación de la vicuña.", body: lorem },
			{ title: "Relación directa", subtitle: "Un proceso comercial basado en conversación y acuerdos claros.", body: lorem },
		],
		featureEyebrow: "Fibra de vicuña",
		featureTitle: "Calidad natural con identidad altoandina",
		featureSubtitle: "Una materia prima excepcional para compradores especializados y cadenas textiles de alto valor.",
		featureBody: lorem,
		featureAction: "Ver características",
		closingTitle: "Hablemos de disponibilidad y oportunidades comerciales.",
		closingSubtitle: "Cada operación comienza con una conversación directa con ANMVB.",
		closingAction: "Iniciar contacto",
	},
	en: {
		pageTitle: "Home",
		eyebrow: "Fiber of Bolivian origin",
		title: "The finest fiber of the Andes, managed by its communities.",
		subtitle: "ANMVB brings together communities that conserve vicuña and market its fiber through an organized process.",
		primaryAction: "Discover the fiber",
		secondaryAction: "Commercial contact",
		introEyebrow: "Origin and purpose",
		introTitle: "A value chain rooted in the territory",
		introSubtitle: "Conservation, community management and quality for buyers who value responsible origin.",
		introBody: lorem,
		values: [
			{ title: "Traceable origin", subtitle: "Fiber connected to producing communities and territories.", body: lorem },
			{ title: "Responsible management", subtitle: "Use compatible with the conservation of wild vicuña.", body: lorem },
			{ title: "Direct relationship", subtitle: "A commercial process based on conversation and clear agreements.", body: lorem },
		],
		featureEyebrow: "Vicuña fiber",
		featureTitle: "Natural quality with a high-Andean identity",
		featureSubtitle: "An exceptional raw material for specialized buyers and high-value textile supply chains.",
		featureBody: lorem,
		featureAction: "View characteristics",
		closingTitle: "Let’s discuss availability and commercial opportunities.",
		closingSubtitle: "Every operation begins with a direct conversation with ANMVB.",
		closingAction: "Start a conversation",
	},
} as const

export const pageContent = {
	es: {
		fiber: {
			pageTitle: "Fibra de Vicuña",
			eyebrow: "Fibra de vicuña",
			title: "Una fibra excepcional desde su origen",
			subtitle: "Información esencial sobre calidad, procedencia, disponibilidad y proceso comercial.",
			image: images.portrait,
			sections: [
				{ eyebrow: "Materia prima", title: "Características de la fibra", subtitle: "Finura, ligereza y valor para aplicaciones textiles especializadas.", body: lorem },
				{ eyebrow: "Procedencia", title: "Origen y trazabilidad", subtitle: "Una conexión clara entre la fibra, el territorio y las comunidades manejadoras.", body: lorem },
				{ eyebrow: "Comercialización", title: "Disponibilidad y proceso de venta", subtitle: "Volúmenes, condiciones y precios se coordinan directamente según cada operación.", body: lorem },
			],
			closingTitle: "Consulte por fibra disponible",
			closingSubtitle: "Cuéntenos qué necesita y conversemos sobre la próxima operación.",
			closingAction: "Contactar a ANMVB",
		},
		organization: {
			pageTitle: "Asociación",
			eyebrow: "La asociación",
			title: "Comunidades organizadas alrededor de la vicuña",
			subtitle: "Una representación nacional para fortalecer el manejo, la conservación y la comercialización de la fibra.",
			image: images.landscape,
			sections: [
				{ eyebrow: "Identidad", title: "Quiénes somos", subtitle: "La organización que representa a manejadores de vicuña de Bolivia.", body: lorem },
				{ eyebrow: "Dirección", title: "Nuestro propósito", subtitle: "Generar valor para las comunidades mediante una gestión sólida y coordinada.", body: lorem },
				{ eyebrow: "Compromiso", title: "Manejo y conservación", subtitle: "La protección de la especie y su hábitat como base de toda actividad productiva.", body: lorem },
			],
			closingTitle: "Conozca una organización con origen comunitario",
			closingSubtitle: "ANMVB articula experiencia territorial y proyección comercial.",
			closingAction: "Hablar con la asociación",
		},
		contact: {
			pageTitle: "Contacto Comercial",
			eyebrow: "Contacto comercial",
			title: "Conversemos sobre fibra de vicuña boliviana",
			subtitle: "El proceso comienza con una consulta directa sobre necesidades, volúmenes y condiciones.",
			image: images.grass,
			sections: [
				{ eyebrow: "Consulta", title: "Comparta su requerimiento", subtitle: "Indique el tipo de comprador, uso previsto y volumen de interés.", body: lorem },
				{ eyebrow: "Disponibilidad", title: "Revisamos la disponibilidad", subtitle: "ANMVB confirma la información correspondiente a la oferta disponible.", body: lorem },
				{ eyebrow: "Acuerdo", title: "Acordamos las condiciones", subtitle: "Precio, documentación, entrega y demás condiciones se definen entre las partes.", body: lorem },
			],
			closingTitle: "Canal comercial de ANMVB",
			closingSubtitle: "Los datos institucionales definitivos se incorporarán antes del lanzamiento.",
			closingAction: "Correo por confirmar",
		},
	},
	en: {
		fiber: {
			pageTitle: "Vicuña Fiber",
			eyebrow: "Vicuña fiber",
			title: "An exceptional fiber from its origin",
			subtitle: "Essential information about quality, provenance, availability and the commercial process.",
			image: images.portrait,
			sections: [
				{ eyebrow: "Raw material", title: "Fiber characteristics", subtitle: "Fineness, lightness and value for specialized textile applications.", body: lorem },
				{ eyebrow: "Provenance", title: "Origin and traceability", subtitle: "A clear connection between the fiber, the territory and managing communities.", body: lorem },
				{ eyebrow: "Commercial process", title: "Availability and sales process", subtitle: "Volumes, terms and pricing are coordinated directly for each operation.", body: lorem },
			],
			closingTitle: "Ask about available fiber",
			closingSubtitle: "Tell us what you need and let’s discuss the next operation.",
			closingAction: "Contact ANMVB",
		},
		organization: {
			pageTitle: "Association",
			eyebrow: "The association",
			title: "Communities organized around vicuña",
			subtitle: "National representation to strengthen management, conservation and fiber commercialization.",
			image: images.landscape,
			sections: [
				{ eyebrow: "Identity", title: "Who we are", subtitle: "The organization representing vicuña management communities in Bolivia.", body: lorem },
				{ eyebrow: "Direction", title: "Our purpose", subtitle: "Creating value for communities through solid and coordinated management.", body: lorem },
				{ eyebrow: "Commitment", title: "Management and conservation", subtitle: "Protecting the species and its habitat as the foundation of productive activity.", body: lorem },
			],
			closingTitle: "Meet an organization rooted in communities",
			closingSubtitle: "ANMVB connects territorial experience with commercial vision.",
			closingAction: "Talk to the association",
		},
		contact: {
			pageTitle: "Commercial Contact",
			eyebrow: "Commercial contact",
			title: "Let’s discuss Bolivian vicuña fiber",
			subtitle: "The process begins with a direct inquiry about requirements, volumes and terms.",
			image: images.grass,
			sections: [
				{ eyebrow: "Inquiry", title: "Share your requirements", subtitle: "Indicate the buyer profile, intended use and volume of interest.", body: lorem },
				{ eyebrow: "Availability", title: "We review availability", subtitle: "ANMVB confirms the information corresponding to the available supply.", body: lorem },
				{ eyebrow: "Agreement", title: "We agree on the terms", subtitle: "Price, documentation, delivery and other conditions are defined by both parties.", body: lorem },
			],
			closingTitle: "ANMVB commercial channel",
			closingSubtitle: "Final institutional contact details will be added before launch.",
			closingAction: "Email to be confirmed",
		},
	},
} as const

export type ContentPage = Exclude<RouteName, "home">
export type LocalizedContent = (typeof pageContent)[Language]
