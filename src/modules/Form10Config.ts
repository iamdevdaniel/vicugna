import { option } from 'src/models'
import { object, string, number, array } from 'yup'

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
    shouldBeCoordinate: 'Formato de coordenada incorrecto',
    shouldBeInteger: 'Debe ser un número entero',
    shouldBeGreaterThanOrEqualTo: (min: number) =>
        `Debe ser mayor o igual que ${min}`,
    shouldBeLessThanOrEqualTo: (max: number) =>
        `Debe ser menor o igual que ${max}`,
}

const regex = {
    coordinates: (value: string | undefined) =>
        value !== undefined &&
        /^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{2,6}$/.test(value),
    numberWithUpToTwoDecimalPlaces: (value: string | undefined) =>
        value !== undefined && /^\d+(\.\d{1,2})?$/.test(value),
}

export const initialValuesForm10Header = {
    department: '',
    regional: '',
    community: '',
    captureSite: '',
    latitude: '',
    longitude: '',
    captureDate: '',
    herdingAttempts: '',
    authorizationCode: '',
}

export const initialValuesForm10Entry = {
    sex: -1,
    age: -1,
    weight: '',
    woolLength: '',
    physicalCondition: -1,
    pregnancyStatus: -1,
    externalParasites: [],
    mangeSeverity: -1,
    dandruff: [],
    canShareWool: [],
    isAlive: [],
    observations: '',
}

export const optionsForm10Entry: Record<string, option[]> = {
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
    dandruff: [{ key: '1', value: 'Tiene caspa' }],
    canShareWool: [{ key: '1', value: 'Puede esquilarse' }],
    isAlive: [{ key: '1', value: 'El animal esta vivo ' }],
}

export const validationSchemaForm10Header = object().shape({
    department: string().required(errors.shouldRequireOption),
    regional: string().required(errors.shouldRequireOption),
    community: string().required(errors.shouldRequireOption),
    captureSite: string()
        .test('shouldRequireField', errors.shouldRequireField, value => !!value)
        .test(
            'maxLength50',
            errors.shouldLimitCharLength(range.captureSiteNameChars.max),
            value => !!value && value.length <= range.captureSiteNameChars.max,
        ),
    latitude: string()
        .test('shouldRequireField', errors.shouldRequireField, value => !!value)
        .test(
            'isNumber',
            errors.shouldBeANumber,
            value => !isNaN(Number(value)),
        )
        .test('shouldBeCoordinate', errors.shouldBeCoordinate, value =>
            regex.coordinates(value),
        ),
    longitude: string()
        .test('shouldRequireField', errors.shouldRequireField, value => !!value)
        .test(
            'isNumber',
            errors.shouldBeANumber,
            value => !isNaN(Number(value)),
        )
        .test('shouldBeCoordinate', errors.shouldBeCoordinate, value =>
            regex.coordinates(value),
        ),
    captureDate: string().required(errors.shouldRequireField),
    herdingAttempts: string()
        .test('isNotEmpty', errors.shouldRequireField, value => !!value)
        .test(
            'isNumber',
            errors.shouldBeANumber,
            value => !isNaN(Number(value)),
        )
        .test(
            'greaterThanOne',
            errors.shouldBeGreaterThan(0),
            value => Number(value) > 1,
        ),
    authorizationCode: string().required(errors.shouldRequireField),
})

export const validationSchemaForm10Entry = object().shape({
    sex: number().min(0, errors.shouldRequireOption),
    age: number().min(0, errors.shouldRequireOption),
    weight: string()
        .test('shouldRequireField', errors.shouldRequireField, value => !!value)
        .test(
            'isNumberWithUpToTwoDecimalPlaces',
            errors.shouldBeANumber,
            value => regex.numberWithUpToTwoDecimalPlaces(value),
        )
        .test(
            'greaterThanOrEqualTo15',
            errors.shouldBeGreaterThanOrEqualTo(range.weight.min),
            value => Number(value as string) >= range.weight.min,
        )
        .test(
            'lessThanOrEqualTo100',
            errors.shouldBeLessThanOrEqualTo(range.weight.max),
            value => Number(value as string) <= range.weight.max,
        ),
    woolLength: string()
        .test('shouldRequireField', errors.shouldRequireField, value => !!value)
        .test(
            'isNumberWithUpToTwoDecimalPlaces',
            errors.shouldBeANumber,
            value => regex.numberWithUpToTwoDecimalPlaces(value),
        )
        .test(
            'greaterThanOrEqualTo15',
            errors.shouldBeGreaterThanOrEqualTo(range.length.min),
            value => Number(value as string) >= range.length.min,
        )
        .test(
            'lessThanOrEqualTo100',
            errors.shouldBeLessThanOrEqualTo(range.length.max),
            value => Number(value as string) <= range.length.max,
        ),
    physicalCondition: number().min(0, errors.shouldRequireOption),
    pregnancyStatus: number().min(0, errors.shouldRequireOption),
    externalParasites: array().of(string()).optional(),
    mangeSeverity: number().min(0, errors.shouldRequireOption),
    dandruff: array().of(string()).optional(),
    canShareWool: array().of(string()).optional(),
    isAlive: array().of(string()).optional(),
    observations: string().optional(),
})
