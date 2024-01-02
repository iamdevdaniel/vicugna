import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Datepicker, IndexPath } from '@ui-kitten/components'
import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { StyleSheet, View, Dimensions } from 'react-native'

import CustomInput from '../components/CustomInput'
import CustomLabel from '../components/CustomLabel'
import CustomSelect from '../components/CustomSelect'
import LabelWithCaption from '../components/LabelWithCaption'
import { getOptionListOf } from '../models/arcmv'

import {
    initialValuesForm10Header as initialValues,
    validationSchemaForm10Header as validationSchema,
} from './Form10Config'

const Form10Header: React.FC = () => {
    const {
        control,
        reset,
        watch,
        getValues,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm({
        mode: 'onBlur',
        defaultValues: initialValues,
        resolver: yupResolver(validationSchema),
    })

    const onSubmit = (values: unknown) => {
        console.log(values)
        console.log('isValid', isValid)
        console.log('errors', errors)
    }

    const departments = getOptionListOf.departments()
    const regionals = getOptionListOf.regionalsByDepartment()
    const communities = getOptionListOf.communitiesByDepartmentAndRegional()
    const selectedDepartment = watch('department')
    const selectedRegional = watch('regional')

    return (
        <View style={styles.container}>
            <View style={styles.fields}>
                <Controller
                    name="department"
                    control={control}
                    render={({ field: { value, onChange, onBlur } }) => (
                        <LabelWithCaption
                            style={styles.field}
                            label={'Departamento'}
                            caption={{
                                category: 'danger',
                                text: errors.department?.message,
                            }}
                        >
                            <CustomSelect
                                placeholder={'Seleccione una opción'}
                                options={departments}
                                value={value}
                                onBlur={onBlur}
                                onSelect={index => {
                                    onChange(
                                        departments[(index as IndexPath).row]
                                            .value,
                                    )
                                    reset({
                                        ...getValues(),
                                        regional: '',
                                        community: '',
                                    })
                                }}
                            />
                        </LabelWithCaption>
                    )}
                />
                <Controller
                    name="regional"
                    control={control}
                    render={({ field: { value, onChange, onBlur } }) => (
                        <LabelWithCaption
                            style={styles.field}
                            label={'Asociación Regional'}
                            caption={{
                                category: 'danger',
                                text: errors.regional?.message,
                            }}
                        >
                            <CustomSelect
                                placeholder={
                                    !selectedDepartment
                                        ? ' '
                                        : 'Seleccione una opción'
                                }
                                options={regionals[selectedDepartment] || []}
                                disabled={!selectedDepartment}
                                value={value}
                                onBlur={onBlur}
                                onSelect={index => {
                                    onChange(
                                        regionals[selectedDepartment][
                                            (index as IndexPath).row
                                        ].value,
                                    )
                                    reset({ ...getValues(), community: '' })
                                }}
                            />
                        </LabelWithCaption>
                    )}
                />
                <Controller
                    name="community"
                    control={control}
                    render={({ field: { value, onChange, onBlur } }) => (
                        <LabelWithCaption
                            style={styles.field}
                            label={'Comunidad Manejadora'}
                            caption={{
                                category: 'danger',
                                text: errors.community?.message,
                            }}
                        >
                            <CustomSelect
                                placeholder={
                                    !selectedRegional
                                        ? ' '
                                        : 'Seleccione una opción'
                                }
                                options={
                                    (communities[selectedDepartment] &&
                                        communities[selectedDepartment]
                                        [selectedRegional]) ||
                                    []
                                }
                                value={value}
                                disabled={!selectedRegional}
                                onBlur={onBlur}
                                onSelect={index =>
                                    onChange(
                                        communities[selectedDepartment]
                                        [selectedRegional]
                                        [(index as IndexPath).row].value,
                                    )
                                }
                            />
                        </LabelWithCaption>
                    )}
                />

                <View style={styles.field}>
                    <CustomLabel style={styles.subtitle} text={'Coordenadas'} />
                    <View style={styles.coordinates}>
                        <Controller
                            name="latitude"
                            control={control}
                            render={({ field: { value, onChange, onBlur } }) => (
                                <LabelWithCaption
                                    style={[
                                        styles.coordinatesField,
                                        styles.firstCoordinate,
                                    ]}
                                    label={'Latitud'}
                                    caption={{
                                        category: 'danger',
                                        text: errors.latitude?.message,
                                    }}
                                >
                                    <CustomInput
                                        value={value}
                                        onBlur={onBlur}
                                        onChange={value => {
                                            onChange(value)
                                        }}
                                    />
                                </LabelWithCaption>
                            )}
                        />
                        <Controller
                            name="longitude"
                            control={control}
                            render={({ field: { value, onChange, onBlur } }) => (
                                <LabelWithCaption
                                    style={styles.coordinatesField}
                                    label={'Longitud'}
                                    caption={{
                                        category: 'danger',
                                        text: errors.longitude?.message,
                                    }}
                                >

                                    <CustomInput
                                        onBlur={onBlur}
                                        value={value}
                                        onChange={value => onChange(value)}
                                    />

                                </LabelWithCaption>
                            )}
                        />
                    </View>
                </View>
                <Controller
                    name="captureSite"
                    control={control}
                    render={({ field: { value, onChange, onBlur } }) => (
                        <LabelWithCaption
                            style={styles.field}
                            label='Sitio de captura'
                            caption={{
                                category: 'danger',
                                text: errors.captureSite?.message,
                            }}
                        >
                            <CustomInput
                                value={value}
                                onBlur={onBlur}
                                onChange={value => onChange(value)}
                            />
                        </LabelWithCaption>
                    )}
                />

                <Controller
                    name="captureDate"
                    control={control}
                    render={({ field: { value, onChange, onBlur } }) => (
                        <LabelWithCaption
                            style={styles.field}
                            label='Fecha de captura'
                            caption={{
                                category: 'danger',
                                text: errors.captureDate?.message,
                            }}
                        >
                            <Datepicker
                                date={value}
                                placement={'left end'}
                                onBlur={onBlur}
                                onSelect={value => onChange(value)}
                            />
                        </LabelWithCaption>
                    )}
                />

                <Controller
                    name="herdingAttempts"
                    control={control}
                    render={({ field: { value, onChange, onBlur } }) => (
                        <LabelWithCaption
                            style={styles.field}
                            label={'Número de repeticiones de arreo'}
                            caption={{
                                category: 'danger',
                                text: errors.herdingAttempts?.message,
                            }}
                        >
                            <CustomInput
                                value={value}
                                onBlur={onBlur}
                                onChange={value => onChange(value)}
                            />
                        </LabelWithCaption>
                    )}
                />
                <Controller
                    name="authorizationCode"
                    control={control}
                    render={({ field: { value, onChange, onBlur } }) => (
                        <LabelWithCaption
                            style={styles.field}
                            label={'Codigo de autorización de esquila'}
                            caption={{
                                category: 'danger',
                                text: errors.authorizationCode?.message,
                            }}
                        >
                            <CustomInput

                                value={value}
                                onBlur={onBlur}
                                onChange={value => onChange(value)}
                            />
                        </LabelWithCaption>
                    )}

                />
            </View>
            <Button
                style={styles.button}
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid}
            >
                Guardar
            </Button>
        </View>
    )
}

export default Form10Header

const getStyles = (screenWidth: number) =>
    StyleSheet.create({
        container: {
            width: '100%',
            height: '100%',
            padding: 8,
            flex: 1,
            justifyContent: 'space-between',
        },
        field: {
            marginBottom: 12,
        },
        fields: { flex: 1 },
        subtitle: {
            marginBottom: 8,
        },
        coordinates: {
            flexDirection: screenWidth <= 500 ? 'column' : 'row',
        },
        coordinatesField: {
            flex: 1,
            marginBottom: screenWidth <= 500 ? 8 : 0,
        },
        firstCoordinate: {
            marginRight: screenWidth > 500 ? 8 : 0,
        },
        button: {
            marginTop: 8,
        },
    })

const screenWidth = Dimensions.get('window').width
const styles = getStyles(screenWidth)
