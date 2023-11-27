import React, { FC } from 'react'
import { View } from 'react-native'
import { Button, Text, Label, RadioGroup, SizeTokens, XStack, YStack } from 'tamagui'
import { WithCoreForm, WithRadioGroupItem } from 'components'
import { WrappedFormProps } from 'models'

const Form10: FC<WrappedFormProps> = ({ formData, onInputChange, onSubmit }) => {

    const handleSubmit = () => {
        onSubmit(formData)
    }

    const [selectedIndex, setIndex] = React.useState(0)
    const [state, setState] = React.useState({ checked: false })


    return (
        <View>
            <Button>
                <Text>BRMC</Text>
            </Button>
            <RadioGroup aria-labelledby="Select one item" defaultValue="3" name="form">
                <YStack width={300} alignItems="center" space="$2">
                    <WithRadioGroupItem size="$3" value="2" label="Second value" />
                    <WithRadioGroupItem size="$3" value="3" label="Third value" />
                    <WithRadioGroupItem size="$3" value="4" label="Fourth value" />
                </YStack>
            </RadioGroup>
        </View>
    )
}


export default WithCoreForm(Form10)