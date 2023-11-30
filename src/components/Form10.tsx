import React from 'react'
import { Formik } from 'formik'
import { } from '@components'
import {
    initialValuesForm10,
    validationSchemaForm10,
} from '@resources/settings'
import { dimensions } from '@styles/FormDimensions'

const Form10: React.FC = () => {
    const handleSubmit = (formValues: Record<string, unknown>) => {
        console.log(formValues)
    }

    return (
        <Formik
            initialValues={initialValuesForm10}
            validationSchema={validationSchemaForm10}
            onSubmit={handleSubmit}
        >
            {({ handleChange, handleSubmit, isValid }) => <></>}
        </Formik>
    )
}

export default Form10
