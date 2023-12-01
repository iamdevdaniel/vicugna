import React from 'react'
import { Formik } from 'formik'
import { ExtendedRadioGroup, ExtendedCheckboxGroup } from '@components'
import {
    initialValuesForm10,
    validationSchemaForm10,
} from '@resources/settings'
import { View, StyleSheet } from 'react-native'
import { TextInput, Text, Checkbox, Button } from 'react-native-paper'

const Form10: React.FC = () => {
    const handleSubmit = (formValues: Record<string, unknown>) => {
        console.log(formValues)
    }

    return (
        <Formik
            initialValues={initialValuesForm10}
            // validationSchema={validationSchemaForm10}
            onSubmit={handleSubmit}
        >
            {({
                handleChange,
                handleBlur,
                values,
                setFieldValue,
                handleSubmit,
            }) => (
                <View style={styles.container}>
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
                            { label: 'Bad', value: 'bad' },
                            { label: 'Regular', value: 'regular' },
                            { label: 'Good', value: 'good' },
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
                        onValueChange={(
                            newValue: { name: string; value: boolean }[],
                        ) => setFieldValue('chckbx-parasites', newValue)}
                        value={values['chckbx-parasites']}
                        options={[
                            {
                                name: 'ticks',
                                label: 'Garrapatas',
                                value: false,
                            },
                            { name: 'lice', label: 'Lice', value: false },
                        ]}
                    />
                    <Button
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
                    </Button>
                </View>
            )}
        </Formik>
    )
}

const styles = StyleSheet.create({
    container: {
        minWidth: 400,
    },
})
export default Form10
