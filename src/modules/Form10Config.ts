import { option } from 'src/models/arcmv'
import { object, string } from 'yup'

import { isGreaterThanMin, isLessThanMax } from '../utilities/helpers'

const range = {
    length: { min: 1, max: 15 },
    weight: { min: 10, max: 100 },
    captureSiteNameChars: { max: 50 },
}

const errors = {
    isSingleOption: 'Escoga una opción',
    isRequired: 'Este campo es requerido',
    maxCharLength: (max: number) => `${max} carácteres como máximo`,
    shouldBeGreaterThan: (min: number) => `Debe ser mayor que ${min}`,
    isNotANumber: 'Debe ser un número',
    isCoordinate: 'Debe ser una coordenada válida',
    isInteger: 'Debe ser un número entero',
}

const regex = {
    coordinates: (value: string | undefined) =>
        value !== undefined &&
        /^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{2,6}$/.test(value),
}

export const initialValuesForm10Header = {
    department: '',
    regional: '',
    community: '',
    captureSite: '',
    latitude: '',
    longitude: '',
    captureDate: null,
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
    department: string().required(errors.isSingleOption),
    regional: string().required(errors.isSingleOption),
    community: string().required(errors.isSingleOption),
    captureSite: string()
        .test('isRequired', errors.isRequired, value => !!value)
        .test(
            'maxLength50',
            errors.maxCharLength(range.captureSiteNameChars.max),
            value => !!value && value.length <= range.captureSiteNameChars.max,
        ),
    latitude: string()
        .test('isRequired', errors.isRequired, value => !!value)
        .test('isNumber', errors.isNotANumber, value => !isNaN(Number(value)))
        .test('isCoordinate', errors.isCoordinate, value =>
            regex.coordinates(value),
        ),
    longitude: string()
        .test('isRequired', errors.isRequired, value => !!value)
        .test('isNumber', errors.isNotANumber, value => !isNaN(Number(value)))
        .test('isCoordinate', errors.isCoordinate, value =>
            regex.coordinates(value),
        ),
    captureDate: string().required(errors.isRequired),
    herdingAttempts: string()
        .test('isNotEmpty', errors.isRequired, value => !!value)
        .test('isNumber', errors.isNotANumber, value => !isNaN(Number(value)))
        .test(
            'greaterThanOne',
            errors.shouldBeGreaterThan(0),
            value => Number(value) > 1,
        ),
    authorizationCode: string().required(errors.isRequired),
})

export const validationSchemaForm10Entry = object().shape({})
