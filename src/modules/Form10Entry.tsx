import { yupResolver } from '@hookform/resolvers/yup'
import { Radio, Input, Button } from '@ui-kitten/components'
import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { ScrollView, StyleSheet } from 'react-native'

import CustomCheckboxGroup from '../components/CustomCheckboxGroup'
import CustomRadioGroup from '../components/CustomRadioGroup'
import LabelWithCaption from '../components/LabelWithCaption'

import {
    initialValuesForm10Entry as initialValues,
    // validationSchemaForm10Entry as validationSchema,
    optionsForm10Entry as options,
} from './Form10Config'

const Form10Entry: React.FC = () => {
    const onSubmit = (values: unknown) => {
        console.log(values)
    }

    const { control, handleSubmit } = useForm({
        defaultValues: initialValues,
        // resolver: yupResolver(validationSchema),
    })

    return (
        <ScrollView style={styles.container}>
            <Controller
                name="sex"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <LabelWithCaption style={styles.field} label="Sexo">
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
                    <LabelWithCaption style={styles.field} label="Edad">
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
                    >
                        <Input
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
                    >
                        <Input
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
                    <LabelWithCaption style={styles.field} label="Gestación">
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
            <Controller
                name="mangeSeverity"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <LabelWithCaption style={styles.field} label="Sarna">
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
                        <Input
                            multiline={true}
                            value={value}
                            onChange={value => onChange(value)}
                        />
                    </LabelWithCaption>
                )}
            />
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
