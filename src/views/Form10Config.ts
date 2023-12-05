import { number, object, string } from 'yup'

export const initialValuesForm10 = {
    'chckbx-parasites': [
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

export const validationSchemaForm10 = object().shape({
    'radio-age': string().required('Escoga una opción'),
    'radio-mange': string().required('Escoga una opción'),
    'radio-parasites': string().required('Escoga una opción'),
    'radio-physical-condition': string().required('Escoga una opción'),
    'radio-pregnancy': string().required('Escoga una opción'),
    'radio-sex': string().required('Escoga una opción'),
    'text-fiber-length': number().required('Este campo es requerido'),
    'text-live-weight': number().required('Este campo es requerido'),
})
