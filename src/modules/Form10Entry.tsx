import { Radio, Input, Button } from '@ui-kitten/components'
import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { ScrollView, StyleSheet } from 'react-native'

import CustomCheckboxGroup from '../components/CustomCheckboxGroup'
import CustomRadioGroup from '../components/CustomRadioGroup'

import {
    initialValuesForm10Entry,
    validationSchemaForm10Entry,
    optionsForm10Entry as options,
} from './Form10Config'

const Form10Entry: React.FC = () => {
    const onSubmit = (values: unknown) => {
        console.log(values)
    }

    const { control, handleSubmit } = useForm({
        defaultValues: initialValuesForm10Entry,
    })

    console.log('Form rerender')

    return (
        <ScrollView style={styles.container}>
            <Controller
                name="sex"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <CustomRadioGroup
                        style={styles.field}
                        label="Sexo"
                        selectedIndex={value}
                        onChange={val => onChange(val)}
                    >
                        {options.sex.map((option, index) => (
                            <Radio key={index}>{option.value}</Radio>
                        ))}
                    </CustomRadioGroup>
                )}
            />
            <Controller
                name="age"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <CustomRadioGroup
                        style={styles.field}
                        label="Edad"
                        selectedIndex={value}
                        onChange={val => onChange(val)}
                    >
                        {options.age.map((option, index) => (
                            <Radio key={index}>{option.value}</Radio>
                        ))}
                    </CustomRadioGroup>
                )}
            />
            <Controller
                name="weight"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <Input
                        style={styles.field}
                        label={'Peso vivo (kg)'}
                        value={value}
                        onChange={value => onChange(value)}
                    />
                )}
            />
            <Controller
                name="woolLength"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <Input
                        style={styles.field}
                        label={'Longitud de fibra (cm)'}
                        value={value}
                        onChange={value => onChange(value)}
                    />
                )}
            />
            <Controller
                name="physicalCondition"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <CustomRadioGroup
                        style={styles.field}
                        label="Condición corporal"
                        selectedIndex={value}
                        onChange={value => onChange(value)}
                    >
                        {options.physicalCondition.map((option, index) => (
                            <Radio key={index}>{option.value}</Radio>
                        ))}
                    </CustomRadioGroup>
                )}
            />
            <Controller
                name="pregnancyStatus"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <CustomRadioGroup
                        style={styles.field}
                        label="Gestación"
                        selectedIndex={value}
                        onChange={value => onChange(value)}
                    >
                        {options.pregnancyStatus.map((option, index) => (
                            <Radio key={index}>{option.value}</Radio>
                        ))}
                    </CustomRadioGroup>
                )}
            />
            <Controller
                name="externalParasites"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <CustomCheckboxGroup
                        style={styles.field}
                        label={'Parásitos externos'}
                        options={options.externalParasites}
                        value={value}
                        onChange={value => onChange(value)}
                    />
                )}
            />
            <Controller
                name="mangeSeverity"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <CustomRadioGroup
                        style={styles.field}
                        label="Sarna"
                        selectedIndex={value}
                        onChange={value => onChange(value)}
                    >
                        {options.mangeSeverity.map((option, index) => (
                            <Radio key={index}>{option.value}</Radio>
                        ))}
                    </CustomRadioGroup>
                )}
            />
            <Controller
                name="dandruff"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <CustomCheckboxGroup
                        style={styles.field}
                        label={'Caspa'}
                        options={options.dandruff}
                        value={value}
                        onChange={value => onChange(value)}
                    />
                )}
            />
            <Controller
                name="canShareWool"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <CustomCheckboxGroup
                        style={styles.field}
                        label={'Esquila'}
                        options={options.canShareWool}
                        value={value}
                        onChange={value => onChange(value)}
                    />
                )}
            />
            <Controller
                name="isAlive"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <CustomCheckboxGroup
                        style={styles.field}
                        label={'Vicuña muerta'}
                        options={options.isAlive}
                        value={value}
                        onChange={value => onChange(value)}
                    />
                )}
            />
            <Controller
                name="observations"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <Input
                        style={styles.field}
                        multiline={true}
                        label={'Observaciones'}
                        value={value}
                        onChange={value => onChange(value)}
                    />
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
