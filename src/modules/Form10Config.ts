import { Form10Header, Form10Entry } from 'vicugna-types'
import { object, string, array, boolean } from 'yup'

const range = {
    captureSiteNameChars: { max: 50 },
    weight: { min: 10, max: 100 },
    length: { min: 1, max: 15 },
}

const errors = {
    shouldRequireOption: 'Escoga una opción',
    shouldRequireField: 'Este campo es requerido',
    shouldLimitCharLength: (max: number) => `${max} carácteres como máximo`,
    shouldBeGreaterThan: (min: number) => `Debe ser mayor que ${min}`,
    shouldBeANumber: 'Debe ser un número',
    shouldHaveUpToTwoDecimalPlaces: 'Debe tener hasta dos decimales',
    shouldBeCoordinate: 'Formato de coordenada incorrecto',
    shouldBeInteger: 'Debe ser un número entero',
    shouldBeGreaterThanOrEqualTo: (min: number, unit: string = '') =>
        `Debe ser mayor o igual que ${min} ${unit}`,
    shouldBeLessThanOrEqualTo: (max: number, unit: string = '') =>
        `Debe ser menor o igual que ${max} ${unit}`,
}

const regex = {
    isValidCoordinate: (value: string | undefined) =>
        value !== undefined &&
        /^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{2,6}$/.test(value),
    isNumber: (value: string | undefined) =>
        value !== undefined && /^-?\d+(\.\d+)?$/.test(value),
    hasUpToTwoDecimalPlaces: (value: string | undefined) =>
        value !== undefined && !/\.\d{3,}/.test(value),
}

export const fieldLabelsForm10Header = {
    department: '1. Departamento',
    regional: '2. Asociación Regional',
    community: '3. Comunidad Manejadora',
    coordiantes: {
        main: '4. Coordenadas',
        latitude: 'Latitud',
        longitude: 'Longitud',
    },
    captureSite: '5. Sitio de captura',
    captureDate: '6. Fecha de captura',
    herdingAttempts: '7. Número de repeticiones de arreo',
    authorizationCode: '8. Codigo de autorización de esquila',
}

export const fieldLabelsForm10Entry = {
    sex: '1. Sexo',
    age: '2. Edad',
    weight: '3. Peso vivo (kg)',
    woolLength: '4. Longitud de fibra (cm)',
    physicalCondition: '5. Condición corporal',
    pregnancyStatus: '6. Gestación',
    externalParasites: '7. Parásitos externos',
    mangeSeverity: '8. Sarna',
    dandruff: '9. Caspa',
    canShareWool: '10. Esquila',
    isAlive: '11. Vicuña muerta',
    observations: '12. Observaciones',
}

export const initialValuesForm10Header: Form10Header = {
    department: '',
    regional: '',
    community: '',
    captureSite: '',
    latitude: '',
    longitude: '',
    captureDate: '',
    herdingAttempts: '1',
    authorizationCode: '',
}

export const initialValuesForm10Entry: Form10Entry = {
    sex: '',
    age: '',
    weight: '',
    woolLength: '',
    physicalCondition: '',
    pregnancyStatus: '',
    externalParasites: [],
    mangeSeverity: '',
    dandruff: false,
    canShareWool: false,
    isAlive: false,
    observations: '',
}

export const optionsForm10Entry = {
    sex: [
        { key: '1', value: 'Macho' },
        { key: '2', value: 'Hembra' },
    ],
    age: [
        { key: '1', value: 'Cría' },
        { key: '2', value: 'Juvenil' },
        { key: '3', value: 'Adulto' },
    ],
    physicalCondition: [
        { key: '1', value: 'Mala' },
        { key: '2', value: 'Regular' },
        { key: '3', value: 'Buena' },
    ],
    pregnancyStatus: [
        { key: '1', value: 'No' },
        { key: '2', value: 'Si' },
        { key: '3', value: 'Si, último tercio' },
    ],
    externalParasites: [
        { key: '1', value: 'Garrapatas' },
        { key: '2', value: 'Piojos' },
    ],
    mangeSeverity: [
        { key: '1', value: 'Leve' },
        { key: '2', value: 'Moderado' },
        { key: '3', value: 'Severo' },
    ],
}

export const validationSchemaForm10Header = object().shape({
    department: string().required(errors.shouldRequireOption),
    regional: string().required(errors.shouldRequireOption),
    community: string().required(errors.shouldRequireOption),
    captureSite: string()
        .required(errors.shouldRequireField)
        .test(
            'maxLength50',
            errors.shouldLimitCharLength(range.captureSiteNameChars.max),
            value => !!value && value.length <= range.captureSiteNameChars.max,
        ),
    latitude: string()
        .required(errors.shouldRequireField)
        .test(
            'isNumber',
            errors.shouldBeANumber,
            value => !isNaN(Number(value)),
        )
        .test('shouldBeCoordinate', errors.shouldBeCoordinate, value =>
            regex.isValidCoordinate(value),
        ),
    longitude: string()
        .required(errors.shouldRequireField)
        .test('shouldRequireField', errors.shouldRequireField, value => !!value)
        .test(
            'isNumber',
            errors.shouldBeANumber,
            value => !isNaN(Number(value)),
        )
        .test('shouldBeCoordinate', errors.shouldBeCoordinate, value =>
            regex.isValidCoordinate(value),
        ),
    captureDate: string().required(errors.shouldRequireField),
    herdingAttempts: string()
        .required(errors.shouldRequireField)
        .test(
            'isNumber',
            errors.shouldBeANumber,
            value => !isNaN(Number(value)),
        )
        .test(
            'greaterThanOne',
            errors.shouldBeGreaterThan(0),
            value => Number(value) > 0,
        ),
    authorizationCode: string().required(errors.shouldRequireField),
})

export const validationSchemaForm10Entry = object().shape({
    sex: string().required(errors.shouldRequireOption),
    age: string().required(errors.shouldRequireOption),
    weight: string()
        .test('shouldRequireField', errors.shouldRequireField, value => !!value)
        .test('isNumber', errors.shouldBeANumber, value =>
            regex.isNumber(value),
        )
        .test(
            'isNumberWithUpToTwoDecimalPlaces',
            errors.shouldHaveUpToTwoDecimalPlaces,
            value => regex.hasUpToTwoDecimalPlaces(value),
        )
        .test(
            'greaterThanOrEqualTo5kg',
            errors.shouldBeGreaterThanOrEqualTo(range.weight.min, 'kg'),
            value => {
                const numberValue = Number(value as string)
                return !isNaN(numberValue) && numberValue >= range.weight.min
            },
        )
        .test(
            'lessThanOrEqualTo15kg',
            errors.shouldBeLessThanOrEqualTo(range.weight.max, 'kg'),
            value => {
                const numberValue = Number(value as string)
                return !isNaN(numberValue) && numberValue <= range.weight.max
            },
        ),
    woolLength: string()
        .test('shouldRequireField', errors.shouldRequireField, value => !!value)
        .test('isNumber', errors.shouldBeANumber, value =>
            regex.isNumber(value),
        )
        .test(
            'isNumberWithUpToTwoDecimalPlaces',
            errors.shouldHaveUpToTwoDecimalPlaces,
            value => regex.hasUpToTwoDecimalPlaces(value),
        )
        .test(
            'greaterThanOrEqualTo1cm',
            errors.shouldBeGreaterThanOrEqualTo(range.length.min, 'cm'),
            value => {
                const numberValue = Number(value as string)
                return !isNaN(numberValue) && numberValue >= range.length.min
            },
        )
        .test(
            'lessThanOrEqualTo15cm',
            errors.shouldBeLessThanOrEqualTo(range.length.max, 'cm'),
            value => Number(value as string) <= range.length.max,
        ),
    physicalCondition: string().required(errors.shouldRequireOption),
    pregnancyStatus: string().required(errors.shouldRequireOption),
    externalParasites: array().of(string()).optional(),
    mangeSeverity: string().required(errors.shouldRequireOption),
    dandruff: boolean().optional(),
    canShareWool: boolean().optional(),
    isAlive: boolean().optional(),
    observations: string().optional(),
})
