import { object, string, number } from 'yup'

export const initialValuesForm10 = {
    'radio-sex': '',
    'radio-age': '',
    'text-live-weight': '',
    'text-fiber-length': '',
    'radio-physical-condition': '',
    'radio-mange': '',
    'radio-pregnancy': '',
    'chckbx-parasites': [
        { name: 'ticks', value: false },
        { name: 'lice', value: false },
    ],
}

export const validationSchemaForm10 = object().shape({
    'radio-sex': string().required('Escoga una opción'),
    'radio-age': string().required('Escoga una opción'),
    'text-live-weight': number().required('Este campo es requerido'),
    'text-fiber-length': number().required('Este campo es requerido'),
    'radio-physical-condition': string().required('Escoga una opción'),
    'radio-mange': string().required('Escoga una opción'),
    'radio-pregnancy': string().required('Escoga una opción'),
    'radio-parasites': string().required('Escoga una opción'),
})
