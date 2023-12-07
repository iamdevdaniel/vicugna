import { object, string } from 'yup'

import { isGreaterThanMin, isLessThanMax } from '../utilities/helpers'

export const initialValuesForm10 = {
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

const range = {
    length: { min: 1, max: 15 },
    weight: { min: 10, max: 100 },
}

export const validationSchemaForm10 = object().shape({
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
            'maxLength',
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
