import { yupResolver } from '@hookform/resolvers/yup'
import { Button } from '@ui-kitten/components'
import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { ScrollView, StyleSheet } from 'react-native'

import CustomCheckboxGroup from '../components/CustomCheckboxGroup'
import CustomInput from '../components/CustomInput'
import CustomRadioGroup from '../components/CustomRadioGroup'
import LabelWithCaption from '../components/LabelWithCaption'

import {
    initialValuesForm10Entry as initialValues,
    validationSchemaForm10Entry as validationSchema,
    optionsForm10Entry as options,
} from './Form10Config'

const Form10Entry: React.FC = () => {
    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm({
        defaultValues: initialValues,
        resolver: yupResolver(validationSchema),
    })

    const onSubmit = (values: unknown) => {
        console.log({ values, errors, isValid })
    }

    return (
        <ScrollView style={styles.container}>
            <Controller
                name="sex"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <LabelWithCaption
                        style={styles.field}
                        label="Sexo"
                        caption={{
                            text: errors.sex?.message,
                            category: 'danger',
                        }}
                    >
                        <CustomRadioGroup
                            selectedIndex={value}
                            options={options.sex}
                            onChange={val => onChange(val)}
                        />
                    </LabelWithCaption>
                )}
            />
            <Controller
                name="age"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <LabelWithCaption
                        style={styles.field}
                        label="Edad"
                        caption={{
                            text: errors.age?.message,
                            category: 'danger',
                        }}
                    >
                        <CustomRadioGroup
                            selectedIndex={value}
                            options={options.age}
                            onChange={val => onChange(val)}
                        />
                    </LabelWithCaption>
                )}
            />
            <Controller
                name="weight"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <LabelWithCaption
                        style={styles.field}
                        label={'Peso vivo (kg)'}
                        caption={{
                            text: errors.weight?.message,
                            category: 'danger',
                        }}
                    >
                        <CustomInput
                            value={value}
                            onChange={value => onChange(value)}
                        />
                    </LabelWithCaption>
                )}
            />
            <Controller
                name="woolLength"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <LabelWithCaption
                        style={styles.field}
                        label={'Longitud de fibra (cm)'}
                        caption={{
                            text: errors.woolLength?.message,
                            category: 'danger',
                        }}
                    >
                        <CustomInput
                            value={value}
                            onChange={value => onChange(value)}
                        />
                    </LabelWithCaption>
                )}
            />
            <Controller
                name="physicalCondition"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <LabelWithCaption
                        style={styles.field}
                        label="Condición corporal"
                        caption={{
                            text: errors.physicalCondition?.message,
                            category: 'danger',
                        }}
                    >
                        <CustomRadioGroup
                            selectedIndex={value}
                            options={options.physicalCondition}
                            onChange={value => onChange(value)}
                        />
                    </LabelWithCaption>
                )}
            />
            <Controller
                name="pregnancyStatus"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <LabelWithCaption
                        style={styles.field}
                        label="Gestación"
                        caption={{
                            text: errors.pregnancyStatus?.message,
                            category: 'danger',
                        }}
                    >
                        <CustomRadioGroup
                            selectedIndex={value}
                            options={options.pregnancyStatus}
                            onChange={value => onChange(value)}
                        />
                    </LabelWithCaption>
                )}
            />
            <Controller
                name="externalParasites"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <LabelWithCaption
                        style={styles.field}
                        label={'Parásitos externos'}
                    >
                        <CustomCheckboxGroup
                            value={value}
                            options={options.externalParasites}
                            onChange={value => onChange(value)}
                        />
                    </LabelWithCaption>
                )}
            />
            {/*
            <Controller
                name="mangeSeverity"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <LabelWithCaption
                        style={styles.field}
                        label="Sarna"
                        caption={{
                            text: errors.mangeSeverity?.message,
                            category: 'danger',
                        }}
                    >
                        <CustomRadioGroup
                            selectedIndex={value}
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
                    <LabelWithCaption style={styles.field} label={'Caspa'}>
                        <CustomCheckboxGroup
                            value={value}
                            options={options.dandruff}
                            onChange={value => onChange(value)}
                        />
                    </LabelWithCaption>
                )}
            />

            <Controller
                name="canShareWool"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <LabelWithCaption style={styles.field} label={'Esquila'}>
                        <CustomCheckboxGroup
                            value={value}
                            options={options.canShareWool}
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
                        label={'Vicuña muerta'}
                    >
                        <CustomCheckboxGroup
                            value={value}
                            options={options.isAlive}
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
                        label={'Observaciones'}
                    >
                        <CustomInput
                            multiline={true}
                            value={value}
                            onChange={value => onChange(value)}
                        />
                    </LabelWithCaption>
                )}
            /> */}
            <Button onPress={handleSubmit(onSubmit)}>Guardar</Button>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 8,
        width: '100%',
    },
    field: {
        marginBottom: 8,
    },
})
export default Form10Entry
