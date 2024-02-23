import { yupResolver } from '@hookform/resolvers/yup'
import {
    Button,
    Datepicker,
    Icon,
    IconProps,
    IndexPath,
    TopNavigation,
    TopNavigationAction,
    useTheme,
} from '@ui-kitten/components'
import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { StyleSheet, View, Text, Dimensions, ScrollView } from 'react-native'
import { Form10Header as FormValues } from 'vicugna-types'

import { StyleConstants } from '../common/stylesConstants'
import CustomInput from '../components/CustomInput'
import CustomLabel from '../components/CustomLabel'
import CustomSelect from '../components/CustomSelect'
import LabelWithCaption from '../components/LabelWithCaption'
import SafeLayout from '../components/SafeLayout'
import { createFormHeader } from '../localDB/services/Form10Service'
import { getOptionListOf } from '../models/arcmv'

import {
    initialValuesForm10Header as initialValues,
    validationSchemaForm10Header as validationSchema,
    fieldLabelsForm10Header as fieldLabels,
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

    const onSubmit = async (values: FormValues) => {
        await createFormHeader(values)
    }

    const theme = useTheme()

    const BackAction = (): React.ReactElement => (
        <TopNavigationAction
            icon={props => (
                <Icon
                    {...props}
                    name="arrow-back"
                    fill={theme['text-control-color']}
                />
            )}
            onPress={() => console.log('Go back!')}
        />
    )

    const departments = getOptionListOf.departments()
    const regionals = getOptionListOf.regionalsByDepartment()
    const communities = getOptionListOf.communitiesByDepartmentAndRegional()
    const selectedDepartment = watch('department')
    const selectedRegional = watch('regional')

    return (
        <SafeLayout>
            <TopNavigation
                accessoryLeft={() => <BackAction />}
                title={() => (
                    <Text style={{ color: theme['text-control-color'] }}>
                        Nueva Esquila
                    </Text>
                )}
                style={{
                    backgroundColor: theme['color-primary-500'],
                }}
            />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Controller
                    name="department"
                    control={control}
                    render={({ field: { value, onChange, onBlur } }) => (
                        <LabelWithCaption
                            style={styles.field}
                            label={fieldLabels.department}
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
                            label={fieldLabels.regional}
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
                            label={fieldLabels.community}
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
                                        communities[selectedDepartment][
                                            selectedRegional
                                        ]) ||
                                    []
                                }
                                value={value}
                                disabled={!selectedRegional}
                                onBlur={onBlur}
                                onSelect={index =>
                                    onChange(
                                        communities[selectedDepartment][
                                            selectedRegional
                                        ][(index as IndexPath).row].value,
                                    )
                                }
                            />
                        </LabelWithCaption>
                    )}
                />

                <View style={styles.field}>
                    <CustomLabel
                        style={styles.subtitle}
                        text={fieldLabels.coordiantes.main}
                    />
                    <View style={styles.coordinates}>
                        <Controller
                            name="latitude"
                            control={control}
                            render={({
                                field: { value, onChange, onBlur },
                            }) => (
                                <LabelWithCaption
                                    style={[
                                        styles.coordinatesField,
                                        styles.firstCoordinate,
                                    ]}
                                    label={fieldLabels.coordiantes.latitude}
                                    caption={{
                                        category: 'danger',
                                        text: errors.latitude?.message,
                                    }}
                                >
                                    <CustomInput
                                        keyboardType="numeric"
                                        value={value}
                                        onBlur={onBlur}
                                        onChangeText={value => {
                                            onChange(value)
                                        }}
                                    />
                                </LabelWithCaption>
                            )}
                        />
                        <Controller
                            name="longitude"
                            control={control}
                            render={({
                                field: { value, onChange, onBlur },
                            }) => (
                                <LabelWithCaption
                                    style={styles.coordinatesField}
                                    label={fieldLabels.coordiantes.longitude}
                                    caption={{
                                        category: 'danger',
                                        text: errors.longitude?.message,
                                    }}
                                >
                                    <CustomInput
                                        keyboardType="numeric"
                                        onBlur={onBlur}
                                        value={value}
                                        onChangeText={onChange}
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
                            label={fieldLabels.captureSite}
                            caption={{
                                category: 'danger',
                                text: errors.captureSite?.message,
                            }}
                        >
                            <CustomInput
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
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
                            label={fieldLabels.captureDate}
                            caption={{
                                category: 'danger',
                                text: errors.captureDate?.message,
                            }}
                        >
                            <Datepicker
                                date={value}
                                placement={'left end'}
                                onBlur={onBlur}
                                onSelect={onChange}
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
                            label={fieldLabels.herdingAttempts}
                            caption={{
                                category: 'danger',
                                text: errors.herdingAttempts?.message,
                            }}
                        >
                            <CustomInput
                                keyboardType="numeric"
                                value={value as string}
                                onBlur={onBlur}
                                onChangeText={onChange}
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
                            label={fieldLabels.authorizationCode}
                            caption={{
                                category: 'danger',
                                text: errors.authorizationCode?.message,
                            }}
                        >
                            <CustomInput
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                            />
                        </LabelWithCaption>
                    )}
                />
            </ScrollView>
            <Button
                style={styles.button}
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid}
                accessoryRight={(props: IconProps) => (
                    <Icon {...props} name="save" />
                )}
            >
                Guardar
            </Button>
        </SafeLayout>
    )
}

export default Form10Header

const getStyles = (screenWidth: number) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        scrollContainer: {
            width: '100%',
            paddingHorizontal: StyleConstants.spacing.s,
            paddingTop: StyleConstants.spacing.s,
        },
        field: {
            marginBottom: StyleConstants.spacing.s,
        },
        subtitle: {
            marginBottom: StyleConstants.spacing.s,
        },
        coordinates: {
            flexDirection: screenWidth <= 500 ? 'column' : 'row',
        },
        coordinatesField: {
            flex: 1,
            marginBottom: screenWidth <= 500 ? StyleConstants.spacing.s : 0,
        },
        firstCoordinate: {
            marginRight: screenWidth > 500 ? StyleConstants.spacing.s : 0,
        },
        button: {
            margin: StyleConstants.spacing.s,
        },
    })

const screenWidth = Dimensions.get('window').width
const styles = getStyles(screenWidth)
