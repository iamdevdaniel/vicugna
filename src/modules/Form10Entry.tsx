import { Radio, Input, Button, CheckBox } from '@ui-kitten/components'
import { Formik } from 'formik'
import React from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { option } from 'src/models/arcmv'

import CustomCheckboxGroup from '../components/CustomCheckboxGroup'
import CustomRadioGroup from '../components/CustomRadioGroup'

import {
    initialValuesForm10Entry,
    validationSchemaForm10Entry,
} from './Form10Config'

const Form10Entry: React.FC = () => {
    const onSubmit = (values: unknown) => {
        console.log(values)
    }

    const options: Record<string, option[]> = {
        sex: [
            { key: '1', value: 'Macho' },
            { key: '2', value: 'Hembra' },
        ],
        age: [
            { key: '1', value: 'Cría' },
            { key: '2', value: 'Juvenil' },
            { key: '3', value: 'Adulto' },
        ],
        physicalCondition: [
            { key: '1', value: 'Mala' },
            { key: '2', value: 'Regular' },
            { key: '3', value: 'Buena' },
        ],
        pregnancyStatus: [
            { key: '1', value: 'No' },
            { key: '2', value: 'Si' },
            { key: '3', value: 'Si, último tercio' },
        ],
        externalParasites: [
            { key: '1', value: 'Garrapatas' },
            { key: '2', value: 'Piojos' },
        ],
        mangeSeverity: [
            { key: '1', value: 'Leve' },
            { key: '2', value: 'Moderado' },
            { key: '3', value: 'Severo' },
        ],
        dandruff: [{ key: '1', value: 'Tiene caspa' }],
        canShareWool: [{ key: '1', value: 'Puede esquilarse' }],
        isAlive: [{ key: '1', value: 'El animal esta vivo ' }],
    }

    return (
        <Formik
            initialValues={initialValuesForm10Entry}
            validationSchema={validationSchemaForm10Entry}
            onSubmit={onSubmit}
            validateOnBlur={false}
            validateOnChange={false}
        >
            {({
                handleChange,
                handleBlur,
                setFieldValue,
                handleSubmit,
                values,
                errors,
                validateForm,
            }) => (
                <ScrollView style={styles.container}>
                    <CustomRadioGroup
                        style={styles.field}
                        label="Sexo"
                        selectedIndex={options.sex.findIndex(
                            option => option.key === values.sex,
                        )}
                        onChange={(index: number) => {
                            setFieldValue('sex', options.sex[index].key)
                        }}
                    >
                        {options.sex.map((option, index) => (
                            <Radio key={index}>{option.value}</Radio>
                        ))}
                    </CustomRadioGroup>
                    <CustomRadioGroup
                        style={styles.field}
                        label="Edad"
                        selectedIndex={options.age.findIndex(
                            option => option.key === values.age,
                        )}
                        onChange={(index: number) => {
                            setFieldValue('age', options.age[index].key)
                        }}
                    >
                        {options.age.map((option, index) => (
                            <Radio key={index}>{option.value}</Radio>
                        ))}
                    </CustomRadioGroup>
                    <Input
                        style={styles.field}
                        label={'Peso vivo (kg)'}
                        value={values.weight}
                        onChange={event => {
                            setFieldValue('weight', event.nativeEvent.text)
                        }}
                        caption={'Tangled up in blue'}
                    />
                    <Input
                        style={styles.field}
                        label={'Longitud de fibra (cm)'}
                        value={values.woolLength}
                        onChange={event => {
                            setFieldValue('woolLength', event.nativeEvent.text)
                        }}
                    />
                    <CustomRadioGroup
                        style={styles.field}
                        label="Condición corporal"
                        selectedIndex={options.physicalCondition.findIndex(
                            option => option.key === values.physicalCondition,
                        )}
                        onChange={(index: number) => {
                            setFieldValue(
                                'physicalCondition',
                                options.physicalCondition[index].key,
                            )
                        }}
                    >
                        {options.physicalCondition.map((option, index) => (
                            <Radio key={index}>{option.value}</Radio>
                        ))}
                    </CustomRadioGroup>
                    <CustomRadioGroup
                        style={styles.field}
                        label="Gestación"
                        selectedIndex={options.pregnancyStatus.findIndex(
                            option => option.key === values.pregnancyStatus,
                        )}
                        onChange={(index: number) => {
                            setFieldValue(
                                'pregnancyStatus',
                                options.pregnancyStatus[index].key,
                            )
                        }}
                    >
                        {options.pregnancyStatus.map((option, index) => (
                            <Radio key={index}>{option.value}</Radio>
                        ))}
                    </CustomRadioGroup>
                    <CustomCheckboxGroup
                        style={styles.field}
                        label={'Parásitos externos'}
                        options={options.externalParasites}
                        value={values.externalParasites}
                        onChange={(selectedValues: string[]) => {
                            setFieldValue('externalParasites', selectedValues)
                        }}
                    />
                    <CustomRadioGroup
                        style={styles.field}
                        label="Gestación"
                        selectedIndex={options.mangeSeverity.findIndex(
                            option => option.key === values.mangeSeverity,
                        )}
                        onChange={(index: number) => {
                            setFieldValue(
                                'mangeSeverity',
                                options.mangeSeverity[index].key,
                            )
                        }}
                    >
                        {options.mangeSeverity.map((option, index) => (
                            <Radio key={index}>{option.value}</Radio>
                        ))}
                    </CustomRadioGroup>
                    <CustomCheckboxGroup
                        style={styles.field}
                        label={'Caspa'}
                        options={options.dandruff}
                        value={values.dandruff}
                        onChange={(selectedValues: string[]) => {
                            setFieldValue('dandruff', selectedValues)
                        }}
                    />
                    <CustomCheckboxGroup
                        style={styles.field}
                        label={'Esquila'}
                        options={options.canShareWool}
                        value={values.canShareWool}
                        onChange={(selectedValues: string[]) => {
                            setFieldValue('canShareWool', selectedValues)
                        }}
                    />
                    <CustomCheckboxGroup
                        style={styles.field}
                        label={'Vicuña muerta'}
                        options={options.isAlive}
                        value={values.isAlive}
                        onChange={(selectedValues: string[]) => {
                            setFieldValue('isAlive', selectedValues)
                        }}
                    />
                    <Input
                        style={styles.field}
                        multiline={true}
                        label={'Observaciones'}
                        value={values.observations}
                        onChange={event => {
                            setFieldValue(
                                'observations',
                                event.nativeEvent.text,
                            )
                        }}
                    />
                    <Button onPress={() => handleSubmit()}>Guardar</Button>
                </ScrollView>
            )}
        </Formik>
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
