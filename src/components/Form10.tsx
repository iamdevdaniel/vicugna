import React, { FC } from 'react'
import { Button, Form, H4, RadioGroup, Text, YStack } from 'tamagui'
import { Formik } from 'formik'
import {
    ExtendedRadioItem,
    ExtendedCheckbox,
    ExtendedInput,
    ExtendedTextArea,
} from '@components'
import { WrappedFormProps } from '@models'
import {
    initialValuesForm10,
    validationSchemaForm10,
} from '@resources/settings'
import { dimensions } from '@styles/FormDimensions'

const Form10: FC<WrappedFormProps> = () => {
    const handleSubmit = (formValues: Record<string, unknown>) => {
        console.log(formValues)
    }

    return (
        <Formik
            initialValues={initialValuesForm10}
            validationSchema={validationSchemaForm10}
            onSubmit={handleSubmit}
        >
            {({ handleChange, handleSubmit }) => (
                <Form onSubmit={handleSubmit}>
                    <YStack space={dimensions.formItemsSpacing} width={300}>
                        <RadioGroup
                            aria-labelledby="Select one item"
                            name="radio-sex"
                            onValueChange={handleChange('radio-sex')}
                        >
                            <H4>{'Sexo'}</H4>
                            <YStack
                                alignItems={dimensions.radioAlign}
                                space={dimensions.radioSpacing}
                            >
                                <ExtendedRadioItem
                                    size={dimensions.radioSize}
                                    value="male"
                                    label="Macho"
                                />
                                <ExtendedRadioItem
                                    size={dimensions.radioSize}
                                    value="female"
                                    label="Hembra"
                                />
                            </YStack>
                        </RadioGroup>
                        <RadioGroup
                            aria-labelledby="Select one item"
                            name="radio-age"
                            onValueChange={handleChange('radio-age')}
                        >
                            <H4>{'Edad'}</H4>
                            <YStack
                                alignItems={dimensions.radioAlign}
                                space={dimensions.radioSpacing}
                            >
                                <ExtendedRadioItem
                                    size={dimensions.radioSize}
                                    value="young"
                                    label="Cría"
                                />
                                <ExtendedRadioItem
                                    size={dimensions.radioSize}
                                    value="juvenile"
                                    label="Juvenil"
                                />
                                <ExtendedRadioItem
                                    size={dimensions.radioSize}
                                    value="adult"
                                    label="Adulto"
                                />
                            </YStack>
                        </RadioGroup>
                        <ExtendedInput
                            inputMode="numeric"
                            size={dimensions.inputSpacing}
                            borderWidth={dimensions.inputBorderWidth}
                            onChangeText={handleChange('text-live-weight')}
                            header={<H4>{'Peso Vivo (Kg)'}</H4>}
                        />
                        <ExtendedInput
                            inputMode="numeric"
                            size={dimensions.inputSpacing}
                            borderWidth={dimensions.inputBorderWidth}
                            onChangeText={handleChange('text-fiber-length')}
                            header={<H4>{'Longitud Fibra (cm)'}</H4>}
                        />
                        <RadioGroup
                            aria-labelledby="Select one item"
                            name="radio-phyisycal-state"
                            onValueChange={handleChange(
                                'radio-phyisycal-state',
                            )}
                        >
                            <H4>{'Condición Corporal'}</H4>
                            <YStack
                                alignItems={dimensions.radioAlign}
                                space={dimensions.radioSpacing}
                            >
                                <ExtendedRadioItem
                                    size={dimensions.radioSize}
                                    value="bad"
                                    label="Malo"
                                />
                                <ExtendedRadioItem
                                    size={dimensions.radioSize}
                                    value="regular"
                                    label="Regular"
                                />
                                <ExtendedRadioItem
                                    size={dimensions.radioSize}
                                    value="good"
                                    label="Bueno"
                                />
                            </YStack>
                        </RadioGroup>
                        <RadioGroup
                            aria-labelledby="Select one item"
                            name="radio-pregnancy"
                            onValueChange={handleChange('radio-pregnancy')}
                        >
                            <H4>{'Gestación'}</H4>
                            <YStack
                                alignItems={dimensions.radioAlign}
                                space={dimensions.radioSpacing}
                            >
                                <ExtendedRadioItem
                                    size={dimensions.radioSize}
                                    value="no"
                                    label="No"
                                />
                                <ExtendedRadioItem
                                    size={dimensions.radioSize}
                                    value="yes"
                                    label="Sí"
                                />
                                <ExtendedRadioItem
                                    size={dimensions.radioSize}
                                    value="yes-3rd-trimester"
                                    label="Sí, último trimestre"
                                />
                            </YStack>
                        </RadioGroup>
                        <RadioGroup
                            aria-labelledby="Select one item"
                            name="radio-parasites"
                            onValueChange={handleChange('radio-parasites')}
                        >
                            <H4>{'Parásitos Externos'}</H4>
                            <YStack
                                alignItems={dimensions.radioAlign}
                                space={dimensions.radioSpacing}
                            >
                                <ExtendedRadioItem
                                    size={dimensions.radioSize}
                                    value="ticks"
                                    label="Garrapatas"
                                />
                                <ExtendedRadioItem
                                    size={dimensions.radioSize}
                                    value="lices"
                                    label="Piojos"
                                />
                            </YStack>
                        </RadioGroup>
                        <RadioGroup
                            aria-labelledby="Select one item"
                            name="radio-mange"
                            onValueChange={handleChange('radio-mange')}
                        >
                            <H4>{'Sarna'}</H4>
                            <YStack
                                alignItems={dimensions.radioAlign}
                                space={dimensions.radioSpacing}
                            >
                                <ExtendedRadioItem
                                    size={dimensions.radioSize}
                                    value="light"
                                    label="Leve"
                                />
                                <ExtendedRadioItem
                                    size={dimensions.radioSize}
                                    value="moderate"
                                    label="Moderado"
                                />
                                <ExtendedRadioItem
                                    size={dimensions.radioSize}
                                    value="severe"
                                    label="Severo"
                                />
                            </YStack>
                        </RadioGroup>
                        <H4>{'Caspa'}</H4>
                        <ExtendedCheckbox
                            id="chkbx-has-dandruff"
                            name="chkbx-has-dandruff"
                            label="Tiene caspa"
                            onChange={() => handleChange('chkbx-has-dandruff')}
                            size={{
                                label: dimensions.checkboxLabelSize,
                                checkBox: dimensions.checkboxSize,
                                spacing: dimensions.checkboxSpacing,
                            }}
                        />
                        <H4>{'Animal muerto'}</H4>
                        <ExtendedCheckbox
                            id="chckbx-is-dead"
                            name="chckbx-is-dead"
                            label="Está muerto"
                            onChange={() => handleChange('chckbx-is-dead')}
                            size={{
                                label: dimensions.checkboxLabelSize,
                                checkBox: dimensions.checkboxSize,
                                spacing: dimensions.checkboxSpacing,
                            }}
                        />
                        <H4>{'Esquila'}</H4>
                        <ExtendedCheckbox
                            id="chckbx-can-be-sheared"
                            name="chckbx-can-be-sheared"
                            label="Se esquila"
                            onChange={() =>
                                handleChange('chckbx-can-be-sheared')
                            }
                            size={{
                                label: dimensions.checkboxLabelSize,
                                checkBox: dimensions.checkboxSize,
                                spacing: dimensions.checkboxSpacing,
                            }}
                        />
                        <ExtendedTextArea
                            size={dimensions.textAreaSize}
                            borderWidth={dimensions.inputBorderWidth}
                            header={<H4>{'Observaciones'}</H4>}
                        />
                        <Form.Trigger asChild>
                            <Button>
                                <Text>Submit</Text>
                            </Button>
                        </Form.Trigger>
                    </YStack>
                </Form>
            )}
        </Formik>
    )
}

export default Form10
