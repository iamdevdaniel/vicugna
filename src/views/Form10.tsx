import { Formik } from 'formik'
import React from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { Text, TextInput } from 'react-native-paper'

import ExtendedButton from '../components/ExtendedButton'
import ExtendedCheckboxGroup from '../components/ExtendedCheckboxGroup'
import ExtendedRadioGroup from '../components/ExtendedRadioGroup'

import { initialValuesForm10 } from './Form10Config'

const Form10: React.FC = () => {
    const handleSubmit = (formValues: Record<string, unknown>) => {
        console.log(formValues)
    }

    return (
        <Formik initialValues={initialValuesForm10} onSubmit={handleSubmit}>
            {({
                handleChange,
                handleBlur,
                values,
                setFieldValue,
                handleSubmit,
            }) => (
                <ScrollView style={styles.container}>
                    <ExtendedRadioGroup
                        onValueChange={handleChange('radio-sex')}
                        value={values['radio-sex']}
                        label="Sexo"
                        options={[
                            { label: 'Hembra', value: 'female' },
                            { label: 'Macho', value: 'male' },
                        ]}
                    />
                    <ExtendedRadioGroup
                        onValueChange={handleChange('radio-age')}
                        value={values['radio-age']}
                        label="Edad"
                        options={[
                            { label: 'Cría', value: 'young' },
                            { label: 'Juvenil', value: 'juvenile' },
                            { label: 'Adulto', value: 'adult' },
                        ]}
                    />
                    <TextInput
                        mode="outlined"
                        label="Peso vivo (kg)"
                        value={values['text-live-weight']}
                        onChangeText={handleChange('text-live-weight')}
                        onBlur={handleBlur('text-live-weight')}
                    />
                    <TextInput
                        mode="outlined"
                        label="Longitud de fibra (cm)"
                        value={values['text-fiber-length']}
                        onChangeText={handleChange('text-fiber-length')}
                        onBlur={handleBlur('text-fiber-length')}
                    />
                    <ExtendedRadioGroup
                        onValueChange={handleChange('radio-physical-condition')}
                        value={values['radio-physical-condition']}
                        label="Condición corporal"
                        options={[
                            { label: 'Mala', value: 'bad' },
                            { label: 'Regular', value: 'regular' },
                            { label: 'Buena', value: 'good' },
                        ]}
                    />
                    <ExtendedRadioGroup
                        onValueChange={handleChange('radio-pregnancy')}
                        value={values['radio-pregnancy']}
                        label="Gestación"
                        options={[
                            { label: 'No', value: 'no' },
                            { label: 'Si', value: 'yes' },
                            { label: 'Si, último tercio', value: 'last-third' },
                        ]}
                    />
                    <ExtendedRadioGroup
                        onValueChange={handleChange('radio-mange')}
                        value={values['radio-mange']}
                        label="Sarna"
                        options={[
                            { label: 'No', value: 'no' },
                            { label: 'Si', value: 'yes' },
                        ]}
                    />
                    <ExtendedCheckboxGroup
                        onValueChange="chckbx-parasites"
                        value={values['chckbx-parasites']}
                        label="Parásitos Externos"
                        options={[
                            {
                                label: 'Garrapatas',
                                name: 'ticks',
                                value: false,
                            },
                            { label: 'Piojos', name: 'ticks', value: false },
                        ]}
                        setFieldValue={setFieldValue}
                    />
                    <ExtendedButton
                        style={{ borderRadius: 5 }}
                        buttonColor="#4749BC"
                        mode="contained"
                        disabled={false}
                        onPress={e => {
                            e.preventDefault()
                            handleSubmit()
                        }}
                    >
                        <Text style={{ color: 'white' }}>Guardar</Text>
                    </ExtendedButton>
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
})
export default Form10
