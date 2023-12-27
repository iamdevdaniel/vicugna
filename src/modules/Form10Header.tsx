import {
    IndexPath,
    Button
} from '@ui-kitten/components'
import { Formik } from 'formik'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import ExtendedSelect from '../components/ExtendedSelect'
import { getListOf } from '../models/arcmv'

const Form10Header: React.FC = () => {

    return (
        <Formik
            initialValues={{
                department: '',
                regional: '',
                community: '',
            }}
            onSubmit={() => { }}
        >
            {({ values, setFieldValue }) => {
                const departments = getListOf.departments()

                const regionals = React.useMemo(() => {
                    if (values.department) {
                        return getListOf.regionals(values.department)
                    }
                    return []
                }, [values.department])

                const communities = React.useMemo(() => {
                    if (values.regional) {
                        return getListOf.communities(
                            values.regional,
                            values.department,
                        )
                    }
                    return []
                }, [values.regional])

                return (
                    <View style={styles.container}>
                        <ExtendedSelect
                            label={'Departamento'}
                            placeholder={'Seleccione una opción'}
                            value={values.department}
                            options={departments}
                            onSelect={index => {
                                setFieldValue(
                                    'department',
                                    departments[(index as IndexPath).row].value,
                                )
                                setFieldValue('regional', '')
                                setFieldValue('community', '')
                            }}
                        />
                        <ExtendedSelect
                            label={'Asociación Regional'}
                            placeholder={'Seleccione una opción'}
                            value={values.regional}
                            options={regionals}
                            disabled={!values.department}
                            onSelect={index => {
                                setFieldValue(
                                    'regional',
                                    regionals[(index as IndexPath).row].value,
                                )
                                setFieldValue('community', '')
                            }}
                        />
                        <ExtendedSelect
                            label={'Comunidad Manejadora'}
                            placeholder={'Seleccione una opción'}
                            value={values.community}
                            options={communities}
                            disabled={!values.regional}
                            onSelect={index => {
                                setFieldValue(
                                    'community',
                                    communities[(index as IndexPath).row].value,
                                )
                            }}
                        />
                        <Button onPress={() => { }}>Guardar</Button>
                    </View>
                )
            }}
        </Formik>
    )
}

export default Form10Header

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
})
