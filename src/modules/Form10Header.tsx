import {
    Input,
    Button,
    Datepicker,
    SelectItem,
    IndexPath
} from '@ui-kitten/components'
import { Formik } from 'formik'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import CustomLabel from '../components/CustomLabel'
import CustomSelect from '../components/CustomSelect'
import { getOptionListOf } from '../models/arcmv'

import {
    initialValuesForm10Header,
    validationSchemaForm10Header,
} from './Form10Config'

const Form10Header: React.FC = () => {
    const onSubmit = (values: unknown) => console.log(values)

    React.useEffect(() => {
        console.log('Parent rendered!')
    })

    // const departments = getOptionListOf.departments()
    // const regionals = getOptionListOf.regionalsByDepartment()
    // const communities = getOptionListOf.communitiesByDepartmentAndRegional()

    console.log('outside useEffect')

    return (
        <Formik
            initialValues={initialValuesForm10Header}
            enableReinitialize={false}
            validationSchema={validationSchemaForm10Header}
            onSubmit={onSubmit}
        >
            {({
                values,
                errors,
                isValid,
                dirty,
                setFieldValue,
                handleSubmit,
            }) => {

                const departments = React.useMemo(() => getOptionListOf.departments(), [])
                console.log('Formik rerender')

                return (
                    <View style={styles.container}>
                        {/* <CustomSelect
                            style={styles.field}
                            label={'Departamento'}
                            placeholder={'Seleccione una opción'}
                            value={values.department}
                            onSelect={index => {
                                setFieldValue('department', departments[(index as IndexPath).row].value)
                                // setValues({
                                //     ...values,
                                //     department: departments[(index as IndexPath).row].value,
                                //     regional: '',
                                //     community: ''
                                // })
                            }}
                        >
                            {departments.map((option, index) => (
                                <SelectItem key={index} title={option.value} />
                            ))}
                        </CustomSelect> */}
                        {/*
                        <CustomSelect
                            style={styles.field}
                            label={'Asociación Regional'}
                            placeholder={'Seleccione una opción'}
                            value={values.regional}
                            disabled={!values.department}
                            onSelect={index => {
                                setValues({
                                    ...values,
                                    regional: regionals[(index as IndexPath).row].value,
                                    community: ''
                                })
                            }}
                        >
                            {regionals.map((option, index) => (
                                <SelectItem key={index} title={option.value} />
                            ))}
                        </CustomSelect>
                        <CustomSelect
                            style={styles.field}
                            label={'Comunidad Manejadora'}
                            placeholder={'Seleccione una opción'}
                            value={values.community}
                            disabled={!values.regional}
                            onSelect={index => {
                                setFieldValue(
                                    'community',
                                    communities[(index as IndexPath).row].value,
                                )
                            }}
                        >
                            {communities.map((option, index) => (
                                <SelectItem key={index} title={option.value} />
                            ))}
                        </CustomSelect> */}
                        <View style={styles.field}>
                            <CustomLabel
                                style={styles.subtitle}
                                text={'Coordenadas'}
                            />
                            <View style={styles.coordinates}>
                                <Input
                                    style={[
                                        styles.coordinatesInput,
                                        styles.firstCoordinate,
                                    ]}
                                    label={'Latitud'}
                                    value={values.latitude}
                                    onChange={event => {
                                        setFieldValue(
                                            'latitude',
                                            event.nativeEvent.text,
                                        )
                                    }}
                                />
                                <Input
                                    style={styles.coordinatesInput}
                                    label={'Longitud'}
                                    value={values.longitude}
                                    onChange={event => {
                                        setFieldValue(
                                            'longitude',
                                            event.nativeEvent.text,
                                        )
                                    }}
                                />
                            </View>
                        </View>
                        <Input
                            style={styles.field}
                            label={'Sitio de captura'}
                            value={values.captureSite}
                            onChange={event => {
                                setFieldValue(
                                    'captureSite',
                                    event.nativeEvent.text,
                                )
                            }}
                        />
                        <Datepicker
                            style={styles.field}
                            label={'Fecha de captura'}
                            date={values.captureDate}
                            placement={'left end'}
                            onSelect={date =>
                                setFieldValue('captureDate', date)
                            }
                        />
                        <Input
                            style={styles.field}
                            label={'Numero de repeticiones de arreo'}
                            value={values.herdingAttempts}
                            onChange={event =>
                                setFieldValue(
                                    'herdingAttempts',
                                    event.nativeEvent.text,
                                )
                            }
                        />
                        <Input
                            style={styles.field}
                            label={'Codigo de autorización de esquila'}
                            value={values.authorizationCode}
                            onChange={event =>
                                setFieldValue(
                                    'authorizationCode',
                                    event.nativeEvent.text,
                                )
                            }
                        />
                        <Button
                            style={styles.button}
                            disabled={!isValid || !dirty}
                            onPress={() => handleSubmit()}
                        >
                            Guardar
                        </Button>
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
        padding: 8,
    },
    field: {
        marginBottom: 12,
    },
    subtitle: {
        marginBottom: 12,
    },
    coordinates: {
        flexDirection: 'row',
    },
    coordinatesInput: {
        flex: 1,
    },
    firstCoordinate: {
        marginRight: 8,
    },
    button: {
        marginTop: 8,
    },
})
