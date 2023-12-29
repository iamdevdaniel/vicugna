import {
    Input,
    Button,
    Datepicker,
    SelectItem,
    IndexPath,
} from '@ui-kitten/components'
import { get } from 'lodash'
import React, { useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { StyleSheet, View } from 'react-native'

import CustomLabel from '../components/CustomLabel'
import CustomSelect from '../components/CustomSelect'
import { getOptionListOf } from '../models/arcmv'

import {
    initialValuesForm10Header,
    validationSchemaForm10Header,
} from './Form10Config'

const Form10Header: React.FC = () => {
    const { control, reset, watch, getValues } = useForm({
        defaultValues: initialValuesForm10Header,
    })
    const onSubmit = (values: unknown) => console.log(values)

    const departments = getOptionListOf.departments()
    const regionals = getOptionListOf.regionalsByDepartment()
    const communities = getOptionListOf.communitiesByDepartmentAndRegional()
    const selectedDepartment = watch('department')
    const selectedRegional = watch('regional')

    return (
        <View style={styles.container}>
            <Controller
                name="department"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <CustomSelect
                        style={styles.field}
                        label={'Departamento'}
                        placeholder={'Seleccione una opción'}
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
                    >
                        {departments.map((option, index) => (
                            <SelectItem key={index} title={option.value} />
                        ))}
                    </CustomSelect>
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
                            !selectedDepartment ? ' ' : 'Seleccione una opción'
                        }
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
                    >
                        {selectedDepartment ? (
                            regionals[selectedDepartment].map(
                                (option, index) => (
                                    <SelectItem
                                        key={index}
                                        title={option.value}
                                    />
                                ),
                            )
                        ) : (
                            <React.Fragment />
                        )}
                    </CustomSelect>
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
                            !selectedRegional ? ' ' : 'Seleccione una opción'
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
                    >
                        {selectedRegional ? (
                            communities[selectedDepartment][
                                selectedRegional
                            ].map((option, index) => (
                                <SelectItem key={index} title={option.value} />
                            ))
                        ) : (
                            <React.Fragment />
                        )}
                    </CustomSelect>
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
                                    styles.coordinatesInput,
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
                                style={styles.coordinatesInput}
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
            <Button style={styles.button}>Guardar</Button>
        </View>
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
