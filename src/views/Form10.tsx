import { Formik } from 'formik'
import React from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'

import ExtendedButton from '../components/ExtendedButton'
import ExtendedCheckboxGroup from '../components/ExtendedCheckboxGroup'
import ExtendedRadioGroup from '../components/ExtendedRadioGroup'
import ExtendedTextInput from '../components/ExtendedTextInput'

import { initialValuesForm10, validationSchemaForm10 } from './Form10Config'

const Form10: React.FC = () => {

    const onSubmit = (values: Record<string, unknown>) => {
        console.log('Form10 onSubmit')
        console.log(values);
    };


    return (
        <Formik
            initialValues={initialValuesForm10}
            validateOnBlur={false}
            validateOnChange={false}
            validationSchema={validationSchemaForm10}
            onSubmit={onSubmit}
        >
            {({
                handleChange,
                handleBlur,
                setFieldValue,
                handleSubmit,
                values,
                errors,
                touched,
                isValid,
                dirty,
                validateForm,
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
                        onValueChange="chbx-parasites"
                        value={values['chbx-parasites']}
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
                        type="submit"
                        mode="contained"
                        onSubmit={async () => {
                            const errors = await validateForm();
                            console.log('Validation errors:', errors);
                            if (Object.keys(errors).length === 0) {
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

const styles = StyleSheet.create({
    container: {
        padding: 8,
        width: '100%',
    },
})
export default Form10
