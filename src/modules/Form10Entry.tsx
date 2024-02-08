import { yupResolver } from '@hookform/resolvers/yup'
import {
    Button,
    IconProps,
    TopNavigation,
    TopNavigationAction,
} from '@ui-kitten/components'
import { Icon, useTheme } from '@ui-kitten/components'
import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Text, ScrollView, StyleSheet } from 'react-native'

import { StyleConstants } from '../common/stylesConstants'
import CustomCheckBox from '../components/CustomCheckbox'
import CustomCheckboxGroup from '../components/CustomCheckboxGroup'
import CustomInput from '../components/CustomInput'
import CustomRadioGroup from '../components/CustomRadioGroup'
import LabelWithCaption from '../components/LabelWithCaption'
import SafeLayout from '../components/SafeLayout'

import {
    initialValuesForm10Entry as initialValues,
    validationSchemaForm10Entry as validationSchema,
    optionsForm10Entry as options,
    fieldLabelsForm10Entry as fieldLabels,
} from './Form10Config'

const Form10Entry: React.FC = () => {
    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm({
        defaultValues: initialValues,
        resolver: yupResolver(validationSchema),
        mode: 'onBlur',
    })

    const onSubmit = (values: unknown) => {
        console.log({ values, errors, isValid })
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

    return (
        <SafeLayout>
            <TopNavigation
                accessoryLeft={() => <BackAction />}
                title={() => (
                    <Text style={{ color: theme['text-control-color'] }}>
                        Registro 7
                    </Text>
                )}
                style={{
                    backgroundColor: theme['color-primary-500'],
                }}
            />
            <ScrollView style={styles.scrollContainer}>
                <Controller
                    name="sex"
                    control={control}
                    render={({ field: { value, onChange, onBlur } }) => (
                        <LabelWithCaption
                            style={styles.field}
                            label={fieldLabels.sex}
                            caption={{
                                text: errors.sex?.message as string,
                                category: 'danger',
                            }}
                        >
                            <CustomRadioGroup
                                value={value}
                                options={options.sex}
                                onChange={val => {
                                    onChange(val)
                                    onBlur()
                                }}
                            />
                        </LabelWithCaption>
                    )}
                />
                <Controller
                    name="age"
                    control={control}
                    render={({ field: { value, onChange, onBlur } }) => (
                        <LabelWithCaption
                            style={styles.field}
                            label={fieldLabels.age}
                            caption={{
                                text: errors.age?.message as string,
                                category: 'danger',
                            }}
                        >
                            <CustomRadioGroup
                                value={value}
                                options={options.age}
                                onChange={val => {
                                    onChange(val)
                                    onBlur()
                                }}
                            />
                        </LabelWithCaption>
                    )}
                />
                <Controller
                    name="weight"
                    control={control}
                    render={({ field: { value, onChange, onBlur } }) => (
                        <LabelWithCaption
                            style={styles.field}
                            label={fieldLabels.weight}
                            caption={{
                                text: errors.weight?.message as string,
                                category: 'danger',
                            }}
                        >
                            <CustomInput
                                value={value}
                                onChangeText={val => onChange(val)}
                                onBlur={onBlur}
                            />
                        </LabelWithCaption>
                    )}
                />
                <Controller
                    name="woolLength"
                    control={control}
                    render={({ field: { value, onChange, onBlur } }) => (
                        <LabelWithCaption
                            style={styles.field}
                            label={fieldLabels.woolLength}
                            caption={{
                                text: errors.woolLength?.message as string,
                                category: 'danger',
                            }}
                        >
                            <CustomInput
                                value={value}
                                onChangeText={val => onChange(val)}
                                onBlur={onBlur}
                            />
                        </LabelWithCaption>
                    )}
                />
                <Controller
                    name="physicalCondition"
                    control={control}
                    render={({ field: { value, onChange, onBlur } }) => (
                        <LabelWithCaption
                            style={styles.field}
                            label={fieldLabels.physicalCondition}
                            caption={{
                                text: errors.physicalCondition
                                    ?.message as string,
                                category: 'danger',
                            }}
                        >
                            <CustomRadioGroup
                                value={value}
                                options={options.physicalCondition}
                                onChange={val => {
                                    onChange(val)
                                    onBlur()
                                }}
                            />
                        </LabelWithCaption>
                    )}
                />
                <Controller
                    name="pregnancyStatus"
                    control={control}
                    render={({ field: { value, onChange, onBlur } }) => (
                        <LabelWithCaption
                            style={styles.field}
                            label={fieldLabels.pregnancyStatus}
                            caption={{
                                text: errors.pregnancyStatus?.message as string,
                                category: 'danger',
                            }}
                        >
                            <CustomRadioGroup
                                value={value}
                                options={options.pregnancyStatus}
                                onChange={val => {
                                    onChange(val)
                                    onBlur()
                                }}
                            />
                        </LabelWithCaption>
                    )}
                />
                <Controller
                    name="externalParasites"
                    control={control}
                    render={({ field: { value, onChange, onBlur } }) => (
                        <LabelWithCaption
                            style={styles.field}
                            label={fieldLabels.externalParasites}
                        >
                            <CustomCheckboxGroup
                                value={value}
                                options={options.externalParasites}
                                onChange={val => {
                                    onChange(val)
                                    onBlur()
                                }}
                            />
                        </LabelWithCaption>
                    )}
                />
                <Controller
                    name="mangeSeverity"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                        <LabelWithCaption
                            style={styles.field}
                            label={fieldLabels.mangeSeverity}
                            caption={{
                                text: errors.mangeSeverity?.message as string,
                                category: 'danger',
                            }}
                        >
                            <CustomRadioGroup
                                value={value}
                                options={options.mangeSeverity}
                                onChange={value => onChange(value)}
                            />
                        </LabelWithCaption>
                    )}
                />
                <Controller
                    name="dandruff"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                        <LabelWithCaption
                            style={styles.field}
                            label={fieldLabels.dandruff}
                        >
                            <CustomCheckBox
                                label={'Tiene caspa'}
                                checked={value}
                                onChange={value => onChange(value)}
                            />
                        </LabelWithCaption>
                    )}
                />
                <Controller
                    name="canShareWool"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                        <LabelWithCaption
                            style={styles.field}
                            label={fieldLabels.canShareWool}
                        >
                            <CustomCheckBox
                                label={'El animal puede esquilar'}
                                checked={value}
                                onChange={value => onChange(value)}
                            />
                        </LabelWithCaption>
                    )}
                />
                <Controller
                    name="isAlive"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                        <LabelWithCaption
                            style={styles.field}
                            label={fieldLabels.isAlive}
                        >
                            <CustomCheckBox
                                label={'El animal está muerto'}
                                checked={value}
                                onChange={value => onChange(value)}
                            />
                        </LabelWithCaption>
                    )}
                />
                <Controller
                    name="observations"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                        <LabelWithCaption
                            style={styles.field}
                            label={fieldLabels.observations}
                        >
                            <CustomInput
                                multiline={true}
                                value={value}
                                onChangeText={value => onChange(value)}
                            />
                        </LabelWithCaption>
                    )}
                />
            </ScrollView>
            <Button
                style={styles.button}
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid}
                accessoryLeft={(props: IconProps) => (
                    <Icon {...props} name="save" />
                )}
            >
                Guardar
            </Button>
        </SafeLayout>
    )
}

const styles = StyleSheet.create({
    scrollContainer: {
        width: '100%',
        paddingHorizontal: StyleConstants.spacing.s,
        paddingTop: StyleConstants.spacing.s,
    },
    field: {
        marginBottom: StyleConstants.spacing.s,
    },
    button: {
        margin: StyleConstants.spacing.s,
    },
})
export default Form10Entry
