import { Radio, Input, Button } from '@ui-kitten/components'
import { Formik } from 'formik'
import React from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { option } from 'src/models/arcmv'

import ExtendedRadioGroup from '../components/ExtendedRadioGroup'

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
        // externalParasites: '',
        mangeSeverity: [
            { key: '1', value: 'Leve' },
            { key: '2', value: 'Moderado' },
            { key: '3', value: 'Severo' },
        ],
        // dandruff: '',
        // canShareWool: '',
        // isAlive: '',
    }

    return (
        <Formik
            initialValues={initialValuesForm10Entry}
            validationSchema={validationSchemaForm10Entry}
            onSubmit={onSubmit}
            // validateOnBlur={false}
            // validateOnChange={false}
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
                    <ExtendedRadioGroup
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
                    </ExtendedRadioGroup>
                    <ExtendedRadioGroup
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
                    </ExtendedRadioGroup>
                    <Input
                        style={styles.field}
                        label={'Peso vivo (kg)'}
                        value={values.weight}
                        onChange={event => {
                            setFieldValue('weight', event.nativeEvent.text)
                        }}
                    />
                    <Input
                        style={styles.field}
                        label={'Longitud de fibra (cm)'}
                        value={values.woolLength}
                        onChange={event => {
                            setFieldValue('woolLength', event.nativeEvent.text)
                        }}
                    />
                    <ExtendedRadioGroup
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
                    </ExtendedRadioGroup>
                    <ExtendedRadioGroup
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
                    </ExtendedRadioGroup>
                    <ExtendedRadioGroup
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
                    </ExtendedRadioGroup>
                    <></>
                    {/* <ExtendedRadioGroup
                        onValueChange={handleChange('radio-age')}
                        value={values['radio-age']}
                        label="Edad"
                        options={[
                            {label: 'Cría', value: 'young' },
                            {label: 'Juvenil', value: 'juvenile' },
                            {label: 'Adulto', value: 'adult' },
                        ]}
                        errorMessage={errors['radio-age']}
                    />
                    <ExtendedTextInput
                        mode="outlined"
                        label="Peso vivo (kg)"
                        keyboardType="numeric"
                        value={values['text-live-weight']}
                        onChangeText={handleChange('text-live-weight')}
                        errorMessage={errors['text-live-weight']}
                    />
                    <ExtendedTextInput
                        mode="outlined"
                        keyboardType="numeric"
                        label="Longitud de fibra (cm)"
                        value={values['text-fiber-length']}
                        onChangeText={handleChange('text-fiber-length')}
                        onBlur={handleBlur('text-fiber-length')}
                        errorMessage={errors['text-fiber-length']}
                    />
                    <ExtendedRadioGroup
                        onValueChange={handleChange('radio-physical-condition')}
                        value={values['radio-physical-condition']}
                        label="Condición corporal"
                        options={[
                            {label: 'Mala', value: 'bad' },
                            {label: 'Regular', value: 'regular' },
                            {label: 'Buena', value: 'good' },
                        ]}
                        errorMessage={errors['radio-physical-condition']}
                    />
                    <ExtendedRadioGroup
                        onValueChange={handleChange('radio-pregnancy')}
                        value={values['radio-pregnancy']}
                        label="Gestación"
                        options={[
                            {label: 'No', value: 'no' },
                            {label: 'Si', value: 'yes' },
                            {label: 'Si, último tercio', value: 'last-third' },
                        ]}
                        errorMessage={errors['radio-pregnancy']}
                    />
                    <ExtendedRadioGroup
                        onValueChange={handleChange('radio-mange')}
                        value={values['radio-mange']}
                        label="Sarna"
                        options={[
                            {label: 'No', value: 'no' },
                            {label: 'Si', value: 'yes' },
                        ]}
                        errorMessage={errors['radio-mange']}
                    />
                    <ExtendedCheckboxGroup
                        onValueChange="chbx-parasites"
                        value={values['chbx-parasites']}
                        label="Parásitos Externos"
                        options={[
                            {
                                label: 'Garrapatas',
                                name: 'ticks',
                                value: false,
                            },
                            {label: 'Piojos', name: 'lice', value: false },
                        ]}
                        setFieldValue={setFieldValue}
                    />
                */}
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
