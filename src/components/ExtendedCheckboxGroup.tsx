import React from 'react'
import { View, Text } from 'react-native'
import { Checkbox } from 'react-native-paper'

interface Option {
    name: string
    label: string
    value: boolean
}

interface ExtendedCheckboxGroupProps {
    options: Option[]
    onValueChange: (value: Option[]) => void
    value: Option[]
}

const ExtendedCheckboxGroup: React.FC<ExtendedCheckboxGroupProps> = ({
    options,
    onValueChange,
    value,
}) => {
    const handlePress = (name: string) => {
        const newValues = value.map(item =>
            item.name === name ? { ...item, value: !item.value } : item,
        )
        onValueChange(newValues)
    }

    return (
        <View>
            {options.map(option => (
                <View key={option.name}>
                    <Text>{option.label}</Text>
                    <Checkbox
                        status={
                            value.find(item => item.name === option.name)?.value
                                ? 'checked'
                                : 'unchecked'
                        }
                        onPress={() => handlePress(option.name)}
                    />
                </View>
            ))}
        </View>
    )
}

export default ExtendedCheckboxGroup
