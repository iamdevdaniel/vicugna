import React, { FC } from 'react'
import { Button, Form, H4, Input, RadioGroup, Text, TextArea, YStack } from 'tamagui'
import { WithCoreForm, WithRadioGroupItem } from '@components'
import { WrappedFormProps } from '@models'
import { dimensions } from '@styles/FormDimensions'

const Form10: FC<WrappedFormProps> = ({ formData, onInputChange, onSubmit }) => {

    const handleSubmit = () => {

    }

    const handleChange = (value: string) => {
        console.log(value)
    }




    return <Form onSubmit={handleSubmit}>
        <YStack space='$3' width={300} >
            <RadioGroup aria-labelledby='Select one item' name='radio-sex'>
                <H4>{`Sexo`}</H4>
                <YStack alignItems={dimensions.radioAlign} space={dimensions.radioSpacing}>
                    <WithRadioGroupItem size={dimensions.radioSize} value='1' label='Macho' />
                    <WithRadioGroupItem size={dimensions.radioSize} value='2' label='Hembra' />
                </YStack>
            </RadioGroup>
            <RadioGroup aria-labelledby='Select one item' name='radio-age' onValueChange={handleChange}>
                <H4>{`Edad`}</H4>
                <YStack alignItems={dimensions.radioAlign} space={dimensions.radioSpacing}>
                    <WithRadioGroupItem size={dimensions.radioSize} value='1' label='Cría' />
                    <WithRadioGroupItem size={dimensions.radioSize} value='2' label='Juvenil' />
                    <WithRadioGroupItem size={dimensions.radioSize} value='3' label='Adulto' />
                </YStack>
            </RadioGroup>
            <>
                <H4>{`Peso Vivo (Kg)`}</H4>
                <Input size={dimensions.inputSpacing} borderWidth={dimensions.inputBorderWidth} />
            </>
            <>
                <H4>{`Long. Fibra (cm)`}</H4>
                <Input size={dimensions.inputSpacing} borderWidth={dimensions.inputBorderWidth} />
            </>
            <RadioGroup aria-labelledby='Select one item' name='radio-phisycal-state'>
                <H4>{`Condición Corporal`}</H4>
                <YStack alignItems={dimensions.radioAlign} space={dimensions.radioSpacing}>
                    <WithRadioGroupItem size={dimensions.radioSize} value='1' label='Malo' />
                    <WithRadioGroupItem size={dimensions.radioSize} value='2' label='Regular' />
                    <WithRadioGroupItem size={dimensions.radioSize} value='3' label='Bueno' />
                </YStack>
            </RadioGroup>
            <RadioGroup aria-labelledby='Select one item' name='radio-pregnancy'>
                <H4>{`Gestación`}</H4>
                <YStack alignItems={dimensions.radioAlign} space={dimensions.radioSpacing}>
                    <WithRadioGroupItem size={dimensions.radioSize} value='1' label='No' />
                    <WithRadioGroupItem size={dimensions.radioSize} value='2' label='Sí' />
                    <WithRadioGroupItem size={dimensions.radioSize} value='3' label='Sí, último trimestre' />
                </YStack>
            </RadioGroup>
            <RadioGroup aria-labelledby='Select one item' name='radio-parasite'>
                <H4>{`Parásitos Externos`}</H4>
                <YStack alignItems={dimensions.radioAlign} space={dimensions.radioSpacing}>
                    <WithRadioGroupItem size={dimensions.radioSize} value='1' label='Garrapatas' />
                    <WithRadioGroupItem size={dimensions.radioSize} value='2' label='Piojos' />
                </YStack>
            </RadioGroup>
            <RadioGroup aria-labelledby='Select one item' name='radio-parasite'>
                <H4>{`Sarna`}</H4>
                <YStack alignItems={dimensions.radioAlign} space={dimensions.radioSpacing}>
                    <WithRadioGroupItem size={dimensions.radioSize} value='1' label='Moderado' />
                    <WithRadioGroupItem size={dimensions.radioSize} value='2' label='Severo' />
                </YStack>
            </RadioGroup>
            <RadioGroup aria-labelledby='Select one item' name='radio-dandruff'>
                <H4>{`Caspa`}</H4>
                <YStack alignItems={dimensions.radioAlign} space={dimensions.radioSpacing}>
                    <WithRadioGroupItem size={dimensions.radioSize} value='1' label='No' />
                    <WithRadioGroupItem size={dimensions.radioSize} value='2' label='Sí' />
                </YStack>
            </RadioGroup>
            <RadioGroup aria-labelledby='Select one item' name='radio-'>
                <H4>{`Esquila`}</H4>
                <YStack alignItems={dimensions.radioAlign} space={dimensions.radioSpacing}>
                    <WithRadioGroupItem size={dimensions.radioSize} value='1' label='No' />
                    <WithRadioGroupItem size={dimensions.radioSize} value='2' label='Sí' />
                </YStack>
            </RadioGroup>
            <RadioGroup aria-labelledby='Select one item' name='radio-is-dead'>
                <H4>{`Vicuña Muerta`}</H4>
                <YStack alignItems={dimensions.radioAlign} space={dimensions.radioSpacing}>
                    <WithRadioGroupItem size={dimensions.radioSize} value='1' label='No' />
                    <WithRadioGroupItem size={dimensions.radioSize} value='2' label='Sí' />
                </YStack>
            </RadioGroup>
            <>
                <H4>{`Observaciones`}</H4>
                <TextArea size={dimensions.textAreaSize} borderWidth={dimensions.inputBorderWidth} />
            </>
            <Form.Trigger asChild>
                <Button>
                    <Text>Submit</Text>
                </Button>
            </Form.Trigger>
        </YStack>
    </Form>
}


export default WithCoreForm(Form10)