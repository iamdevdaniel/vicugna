import React, { FC } from 'react'
import {
    Button,
    Checkbox,
    Form,
    H4,
    Input,
    Label,
    RadioGroup,
    Text,
    TextArea,
    XStack,
    YStack,
} from 'tamagui'
import { Check as CheckIcon } from '@tamagui/lucide-icons'
import { Formik } from 'formik'
import { WithCoreForm, RadioGroupItem } from '@components'
import { WrappedFormProps } from '@models'
import { dimensions } from '@styles/FormDimensions'

const Form10: FC<WrappedFormProps> = ({
    formData,
    onInputChange,
    onSubmit,
}) => {
    const handleSubmit = (formValues: Record<string, unknown>) => {
        console.log(formValues)
    }

    return <Formik initialValues={{ 'radio-sex': '' }} onSubmit={handleSubmit}>
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
                            <RadioGroupItem
                                size={dimensions.radioSize}
                                value="male"
                                label="Macho"
                            />
                            <RadioGroupItem
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
                            <RadioGroupItem
                                size={dimensions.radioSize}
                                value="young"
                                label="Cría"
                            />
                            <RadioGroupItem
                                size={dimensions.radioSize}
                                value="juvenile"
                                label="Juvenil"
                            />
                            <RadioGroupItem
                                size={dimensions.radioSize}
                                value="adult"
                                label="Adulto"
                            />
                        </YStack>
                    </RadioGroup>
                    <>
                        <H4>{'Peso Vivo (Kg)'}</H4>
                        <Input
                            size={dimensions.inputSpacing}
                            borderWidth={dimensions.inputBorderWidth}
                            onChangeText={handleChange('text-live-weight')}
                        />
                    </>
                    <>
                        <H4>{'Long. Fibra (cm)'}</H4>
                        <Input
                            size={dimensions.inputSpacing}
                            borderWidth={dimensions.inputBorderWidth}
                            onChangeText={handleChange('text-fiber-length')}
                        />
                    </>
                    <RadioGroup
                        aria-labelledby="Select one item"
                        name="radio-phisycal-state"
                        onValueChange={handleChange('radio-phisycal-state')}
                    >
                        <H4>{'Condición Corporal'}</H4>
                        <YStack
                            alignItems={dimensions.radioAlign}
                            space={dimensions.radioSpacing}
                        >
                            <RadioGroupItem
                                size={dimensions.radioSize}
                                value="bad"
                                label="Malo"
                            />
                            <RadioGroupItem
                                size={dimensions.radioSize}
                                value="regular"
                                label="Regular"
                            />
                            <RadioGroupItem
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
                            <RadioGroupItem
                                size={dimensions.radioSize}
                                value="no"
                                label="No"
                            />
                            <RadioGroupItem
                                size={dimensions.radioSize}
                                value="yes"
                                label="Sí"
                            />
                            <RadioGroupItem
                                size={dimensions.radioSize}
                                value="yes-3rd-trimester"
                                label="Sí, último trimestre"
                            />
                        </YStack>
                    </RadioGroup>
                    <RadioGroup
                        aria-labelledby="Select one item"
                        name="radio-parasite"
                        onValueChange={handleChange('radio-parasite')}
                    >
                        <H4>{'Parásitos Externos'}</H4>
                        <YStack
                            alignItems={dimensions.radioAlign}
                            space={dimensions.radioSpacing}
                        >
                            <RadioGroupItem
                                size={dimensions.radioSize}
                                value="1"
                                label="Garrapatas"
                            />
                            <RadioGroupItem
                                size={dimensions.radioSize}
                                value="2"
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
                            <RadioGroupItem
                                size={dimensions.radioSize}
                                value="light"
                                label="Leve"
                            />
                            <RadioGroupItem
                                size={dimensions.radioSize}
                                value="moderate"
                                label="Moderado"
                            />
                            <RadioGroupItem
                                size={dimensions.radioSize}
                                value="severe"
                                label="Severo"
                            />
                        </YStack>
                    </RadioGroup>
                    <H4>{'Caspa'}</H4>
                    <XStack alignItems='center' space={dimensions.checkboxSpacing}>
                        <Checkbox id={'chckbx-dandruff'} size={dimensions.checkboxSize} >
                            <Checkbox.Indicator>
                                <CheckIcon />
                            </Checkbox.Indicator>
                        </Checkbox>
                        <Label size={dimensions.checkboxLabelSize} htmlFor={'chckbx-dandruff'}>
                            {`Tiene caspa`}
                        </Label>
                    </XStack>
                    <H4>{'Animal muerto'}</H4>
                    <XStack alignItems='center' space={dimensions.checkboxSpacing}>
                        <Checkbox id={'chckbx-is-dead'} size={dimensions.checkboxSize} >
                            <Checkbox.Indicator>
                                <CheckIcon />
                            </Checkbox.Indicator>
                        </Checkbox>
                        <Label size={dimensions.checkboxLabelSize} htmlFor={'chckbx-is-dead'}>
                            {`Esta muerto`}
                        </Label>
                    </XStack>
                    <H4>{'Esquila'}</H4>
                    <XStack alignItems='center' space={dimensions.checkboxSpacing}>
                        <Checkbox id={'chckbx-can-be-sheared'} size={dimensions.checkboxSize} >
                            <Checkbox.Indicator>
                                <CheckIcon />
                            </Checkbox.Indicator>
                        </Checkbox>
                        <Label size={dimensions.checkboxLabelSize} htmlFor={'chckbx-can-be-sheared'}>
                            {`Se esquila`}
                        </Label>
                    </XStack>
                    <>
                        <H4>{'Observaciones'}</H4>
                        <TextArea
                            size={dimensions.textAreaSize}
                            borderWidth={dimensions.inputBorderWidth}
                        />
                    </>
                    <Form.Trigger asChild>
                        <Button>
                            <Text>Submit</Text>
                        </Button>
                    </Form.Trigger>
                </YStack>
            </Form>
        )}
    </Formik>
}

export default WithCoreForm(Form10)
