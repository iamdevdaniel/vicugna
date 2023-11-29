import { object, string, number } from 'yup';

export const initialValues = {
    'radio-sex': '',
    'radio-age': '',
    'text-live-weight': '',
    'text-fiber-length': '',
    'radio-phyisycal-state': '',
    'radio-mange': '',
    'radio-pregnancy': '',
    'radio-parasites': '',
    'chkbx-has-dandruff': null,
    'chckbx-is-dead': null,
    'chckbx-can-be-sheared': null
}

export const validationSchema = object().shape({
    'radio-sex': string().
        required('Escoga una opción'),
    'radio-age': string().required('Escoga una opción'),
    'text-live-weight': number().required('Este campo es requerido'),
    'text-fiber-length': number().required('Este campo es requerido'),
    'radio-phyisycal-state': string().required('Escoga una opción'),
    'radio-mange': string().required('Escoga una opción'),
    'radio-pregnancy': string().required('Escoga una opción'),
    'radio-parasites': string().required('Escoga una opción'),
})