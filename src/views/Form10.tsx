import { Formik, FormikTouched, FormikErrors } from 'formik'
import React, { useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'

import ExtendedButton from '../components/ExtendedButton'
import ExtendedCheckboxGroup from '../components/ExtendedCheckboxGroup'
import ExtendedRadioGroup from '../components/ExtendedRadioGroup'
import ExtendedTextInput from '../components/ExtendedTextInput'

import { initialValuesForm10, validationSchemaForm10 } from './Form10Config'

const Form10: React.FC = () => {

    const [wasSubmitted, setWasSubmitted] = React.useState(false)

    const handleSubmit = (formValues: Record<string, unknown>) => {
        setWasSubmitted(true)
        console.log(formValues)
    }

    return (
        <Formik
            initialValues={initialValuesForm10}
            onSubmit={handleSubmit}
            validateOnBlur={false}
            validateOnChange={false}
            validationSchema={validationSchemaForm10}
        >
            {({
                handleChange,
                handleBlur,
                handleSubmit,
                setFieldValue,
                values,
                errors,
                touched,
                isValid,
                dirty,
                validateForm
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
                        errorMessage={errors['radio-sex']}
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
                            { label: 'Mala', value: 'bad' },
                            { label: 'Regular', value: 'regular' },
                            { label: 'Buena', value: 'good' },
                        ]}
                        errorMessage={errors['radio-physical-condition']}
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
                        errorMessage={errors['radio-pregnancy']}
                    />
                    <ExtendedRadioGroup
                        onValueChange={handleChange('radio-mange')}
                        value={values['radio-mange']}
                        label="Sarna"
                        options={[
                            { label: 'No', value: 'no' },
                            { label: 'Si', value: 'yes' },
                        ]}
                        errorMessage={errors['radio-mange']}
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
                            { label: 'Piojos', name: 'lice', value: false },
                        ]}
                        setFieldValue={setFieldValue}
                    />
                    <ExtendedButton
                        style={{ borderRadius: 5 }}
                        buttonColor="#4749BC"
                        mode="contained"
                        disabled={!dirty || !isValid}
                        onPress={async e => {
                            e.preventDefault();
                            setWasSubmitted(true);
                            await validateForm();
                            if (isValid) {
                                handleSubmit();
                            }
                        }}
                    >
                        <Text style={{ color: 'white' }}>Guardar</Text>
                    </ExtendedButton>
                </ScrollView>
            )}
        </Formik>
    )
}

function getErrorMessage(
    touched: FormikTouched<Record<string, unknown>>,
    errors: FormikErrors<Record<string, unknown>>,
    fieldName: string,
): string | undefined {
    return touched[fieldName] && errors[fieldName]
        ? (errors[fieldName] as string)
        : undefined
}

const styles = StyleSheet.create({
    container: {
        padding: 8,
        width: '100%',
    },
})
export default Form10
