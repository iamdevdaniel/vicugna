import { yupResolver } from '@hookform/resolvers/yup'
import {
    Input,
    Button,
    Datepicker,
    SelectItem,
    IndexPath,
} from '@ui-kitten/components'
import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { StyleSheet, View, Dimensions } from 'react-native'

import CustomLabel from '../components/CustomLabel'
import CustomSelect from '../components/CustomSelect'
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
        formState: { errors },
    } = useForm({
        defaultValues: initialValues,
        resolver: yupResolver(validationSchema),
    })

    const onSubmit = (values: unknown) => console.log(values)

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
                    render={({ field: { value, onChange } }) => (
                        <CustomSelect
                            style={styles.field}
                            label={'Departamento'}
                            placeholder={'Seleccione una opción'}
                            options={departments}
                            value={value}
                            onSelect={index => {
                                onChange(
                                    departments[(index as IndexPath).row].value,
                                )
                                reset({
                                    ...getValues(),
                                    regional: '',
                                    community: '',
                                })
                            }}
                        />
                    )}
                />
                <Controller
                    name="regional"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                        <CustomSelect
                            style={styles.field}
                            label={'Asociación Regional'}
                            placeholder={
                                !selectedDepartment
                                    ? ' '
                                    : 'Seleccione una opción'
                            }
                            options={regionals[selectedDepartment] || []}
                            helperText={{ category: 'danger', text: '' }}
                            disabled={!selectedDepartment}
                            value={value}
                            onSelect={index => {
                                onChange(
                                    regionals[selectedDepartment][
                                        (index as IndexPath).row
                                    ].value,
                                )
                                reset({ ...getValues(), community: '' })
                            }}
                        />
                    )}
                />
                <Controller
                    name="community"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                        <CustomSelect
                            style={styles.field}
                            label={'Comunidad Manejadora'}
                            placeholder={
                                !selectedRegional
                                    ? ' '
                                    : 'Seleccione una opción'
                            }
                            options={
                                (communities[selectedDepartment] &&
                                    communities[selectedDepartment][
                                        selectedRegional
                                    ]) ||
                                []
                            }
                            value={value}
                            disabled={!selectedRegional}
                            onSelect={index =>
                                onChange(
                                    communities[selectedDepartment][
                                        selectedRegional
                                    ][(index as IndexPath).row].value,
                                )
                            }
                        />
                    )}
                />
                <View style={styles.field}>
                    <CustomLabel style={styles.subtitle} text={'Coordenadas'} />
                    <View style={styles.coordinates}>
                        <Controller
                            name="latitude"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <Input
                                    style={[
                                        styles.coordinatesField,
                                        styles.firstCoordinate,
                                    ]}
                                    label={'Latitud'}
                                    value={value}
                                    onChange={value => {
                                        onChange(value)
                                    }}
                                />
                            )}
                        />
                        <Controller
                            name="longitude"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <Input
                                    style={styles.coordinatesField}
                                    label={'Longitud'}
                                    value={value}
                                    onChange={value => onChange(value)}
                                />
                            )}
                        />
                    </View>
                </View>
                <Controller
                    name="captureSite"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                        <Input
                            style={styles.field}
                            label={'Sitio de captura'}
                            value={value}
                            onChange={value => onChange(value)}
                        />
                    )}
                />
                <Controller
                    name="captureDate"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                        <Datepicker
                            style={styles.field}
                            label={'Fecha de captura'}
                            date={value}
                            placement={'left end'}
                            onSelect={value => onChange(value)}
                        />
                    )}
                />
                <Controller
                    name="herdingAttempts"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                        <Input
                            style={styles.field}
                            label={'Número de repeticiones de arreo'}
                            value={value}
                            onChange={value => onChange(value)}
                        />
                    )}
                />
                <Controller
                    name="authorizationCode"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                        <Input
                            style={styles.field}
                            label={'Codigo de autorización de esquila'}
                            value={value}
                            onChange={value => onChange(value)}
                        />
                    )}
                />
            </View>
            <Button style={styles.button} onPress={handleSubmit(onSubmit)}>
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
            marginBottom: 12,
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
