## Tech Stack

### App
- **Expo / React Native**: Mobile app (offline-first, cross-platform)
- **WatermelonDB**: Local database for offline data
- **ImageKit**: Image upload, optimization, CDN

### Backend
- **Express (Node.js)**: API server (future)
- **Go**: Alternative backend service (future)
- **DigitalOcean**: Cloud hosting for backend and sync

### Monorepo
- **npm workspaces**: Manages app and backend in one repository

## Reglas de los formularios

### Paso 1: Participantes

- **Nombre (`name`)**: obligatorio; no puede contener solamente espacios.
- **Apellidos (`lastNames`)**: obligatorio; no puede contener solamente espacios.
- **Género (`gender`)**: debe ser Masculino (`M`) o Femenino (`F`).
- **Cédula de identidad (`identityNumber`)**: obligatoria; debe contener solamente números enteros y ser mayor a cero.
- **Firma (`signature`)**: obligatoria.
- **Notas (`notes`)**: opcionales.

### Paso 2: Registro de esquila

#### Información básica

- **Sitio (`site`)**: obligatorio; no puede contener solamente espacios.
- **Latitud (`latitude`)**: obligatoria; debe ser un número entre -90 y 90.
- **Longitud (`longitude`)**: obligatoria; debe ser un número entre -180 y 180.
- **Cantidad de arreos (`roundupCount`)**: obligatoria; debe ser un número entero entre 1 y 100.
- **Fecha (`eventDate`)**: obligatoria; debe ser una fecha real con formato `DD/MM/YYYY`.
- **Hora inicial (`startTime`)**: obligatoria; debe ser una hora válida con formato `HH:mm`.
- **Hora conclusión (`endTime`)**: obligatoria; debe ser una hora válida con formato `HH:mm` y posterior a la Hora inicial (`startTime`).

#### Registro individual

- **Número de arete (`tagNumber`)**: obligatorio; debe ser un número entero entre 1 y 2.147.483.647.
- **Sexo (`sex`)**: debe ser Hembra (`F`) o Macho (`M`).
- **Edad (`ageCategory`)**: debe ser Cría (`Cria`), Juvenil (`Juvenil`) o Adulto (`Adulto`).
- **Peso vivo (`liveWeight`)**: obligatorio; debe ser mayor a 0 y no superar 100 kg.
- **Longitud de fibra (`fiberLength`)**: obligatoria; debe ser mayor a 0 y no superar 15 cm.
- **Condición corporal (`bodyCondition`)**: debe ser Malo, Regular o Bueno.
- **Gestación (`gestationStatus`)**: puede ser No, Sí (`Si`) o Sí, último tercio (`Si ultimo tercio`). Depende de Sexo (`sex`) y Edad (`ageCategory`): solamente una hembra adulta puede tener un valor distinto de No.
- **Parásitos externos (`externalParasites`)**: puede contener Garrapata, Piojos, ambos sin repetir, o ninguno.
- **Sarna (`mangeSeverity`)**: debe ser Ninguna, Leve, Moderado o Severo.
- **Caspa (`hasDandruff`)**: debe ser Sí o No.
- **Muerto (`isDead`)**: debe ser Sí o No.
- **Esquilado (`isSheared`)**: es un valor derivado de Edad (`ageCategory`) y Gestación (`gestationStatus`). Es No para una Cría o cuando Gestación es Sí; es Sí para las demás combinaciones válidas, incluido Sí, último tercio.
- **Observaciones (`observations`)**: opcionales.

### Paso 3: Registro de fibra

#### Información básica

- **Fecha inicio (`startDate`)**: obligatoria; debe ser una fecha real con formato `DD/MM/YYYY`.
- **Fecha conclusión (`endDate`)**: obligatoria para completar el paso; debe ser una fecha real con formato `DD/MM/YYYY`.
- **Lugar (`site`)**: obligatorio; no puede contener solamente espacios.
- **Responsables (`supervisors`)**: obligatorio; no puede contener solamente espacios.

#### Datos comunes

- **Nro. de vellón (`fleeceNumber`)**: obligatorio; debe contener solamente números enteros y ser mayor a cero.
- **Peso bruto (`grossWeight`)**: obligatorio; debe ser mayor a 0 y no superar 4.000 g.
- **Tipo (`cleaningType`)**: selecciona Limpiado (`grooming`) o Predescerdado (`dehearing`). Cada Registro de fibra debe tener exactamente uno de los dos tipos.

#### Limpiado

- **Peso vellón limpio (`cleanWeight`)**: obligatorio; debe ser mayor a 0, no superar 4.000 g y no superar Peso bruto (`grossWeight`).
- **Peso braga (`dirtyWeight`)**: obligatorio; debe ser mayor a 0, no superar 4.000 g y no superar Peso bruto (`grossWeight`).
- **Peso total fibra (`totalWeight`)**: es un valor derivado de Peso vellón limpio (`cleanWeight`) y Peso braga (`dirtyWeight`). Debe ser igual a su suma y no superar Peso bruto (`grossWeight`).

#### Predescerdado

- **Peso fibra predescerdada (`dehairedWeight`)**: obligatorio; debe ser mayor a 0 y no superar 4.000 g.
- **Peso cerda (`bristleWeight`)**: obligatorio; debe ser mayor a 0 y no superar 4.000 g.
- **Caspa (`hasDandruff`)**: debe ser Sí o No.
- **Nombre del predescerdador (a) (`dehairerName`)**: obligatorio; no puede contener solamente espacios.
- **Firma (`signature`)**: obligatoria.
