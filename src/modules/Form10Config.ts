import { isInteger } from 'formik'
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

export const initialValuesForm10Entry = {
    'chbx-parasites': [
        { name: 'ticks', value: false },
        { name: 'lice', value: false },
    ],
    'radio-age': '',
    'radio-mange': '',
    'radio-physical-condition': '',
    'radio-pregnancy': '',
    'radio-sex': '',
    'text-fiber-length': '',
    'text-live-weight': '',
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

export const validationSchemaForm10Entry = object().shape({
    'radio-age': string().required('Escoga una opción'),
    'radio-mange': string().required('Escoga una opción'),
    'radio-physical-condition': string().required('Escoga una opción'),
    'radio-pregnancy': string().required('Escoga una opción'),
    'radio-sex': string().required('Escoga una opción'),
    'text-fiber-length': string()
        .matches(
            /^[0-9]*\.?[0-9]{0,3}$/,
            'Este campo debe ser un número con hasta 3 decimales',
        )
        .test(
            'minLength',
            `La longitud debe ser mayor que ${range.length.min} cm`,
            isGreaterThanMin(range.length.min),
        )
        .test(
            'maxCharLength',
            `La longitud debe ser menor que ${range.length.max} cm`,
            isLessThanMax(range.length.max),
        )
        .required('Este campo es requerido'),
    'text-live-weight': string()
        .matches(
            /^[0-9]*\.?[0-9]{0,3}$/,
            'Este campo debe ser un número con hasta 3 decimales',
        )
        .test(
            'minWeight',
            `El peso debe ser mayor que ${range.weight.min} kg`,
            isGreaterThanMin(range.weight.min),
        )
        .test(
            'maxWeight',
            `El peso debe ser menor que ${range.weight.max} kg`,
            isLessThanMax(range.weight.max),
        )
        .required('Este campo es requerido'),
})
