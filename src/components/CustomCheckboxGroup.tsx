import { CheckBox } from '@ui-kitten/components'
import React from 'react'
import { View, ViewStyle, StyleSheet } from 'react-native'

import CustomLabel from './CustomLabel'

interface CustomCheckboxGroupProps {
    options: { key: string; value: string }[]
    onChange: (selectedValues: string[]) => void
    value: string[]
    label?: string
    style?: ViewStyle
}

const CustomCheckboxGroup: React.FC<CustomCheckboxGroupProps> = ({
    options,
    onChange,
    value,
    label,
    style: externalStyle,
}) => {
    const handleSelect = (selectedValue: string) => {
        const currentIndex = value.indexOf(selectedValue)
        let newSelectedValues = [...value]

        if (currentIndex === -1) {
            newSelectedValues.push(selectedValue)
        } else {
            newSelectedValues = newSelectedValues.filter(
                val => val !== selectedValue,
            )
        }

        onChange(newSelectedValues)
    }

    return (
        <View style={[style.container, externalStyle]}>
            {label && <CustomLabel text={label} />}
            {options.map(option => (
                <CheckBox
                    style={style.checkbox}
                    key={option.key}
                    checked={value.includes(option.value)}
                    onChange={() => handleSelect(option.value)}
                >
                    {option.value}
                </CheckBox>
            ))}
        </View>
    )
}

export default CustomCheckboxGroup

const style = StyleSheet.create({
    container: {
        width: '100%',
    },
    checkbox: { marginVertical: 8 },
})
