import { RadioGroup, RadioGroupProps, Radio } from '@ui-kitten/components'
import React from 'react'
import { View, StyleSheet } from 'react-native'

import { option } from '../models'

import CustomLabel from './CustomLabel'

interface CustomRadioGroupProps
    extends Omit<RadioGroupProps, 'onChange' | 'selectedIndex'> {
    label?: string
    options?: option[]
    value?: string
    onChange?: (value: string) => void
}

const CustomRadioGroup: React.FC<CustomRadioGroupProps> = ({
    options = [],
    label,
    value,
    onChange,
    ...props
}) => {
    const selectedIndex = options.findIndex(option => option.value === value)

    return (
        <View style={styles.container}>
            {label && <CustomLabel text={label} />}
            <RadioGroup
                {...props}
                selectedIndex={selectedIndex}
                onChange={index => {
                    if (onChange && options[index]) {
                        onChange(options[index].value)
                    }
                }}
            >
                {options.map((option, index) => (
                    <Radio key={index}>{option.value}</Radio>
                ))}
            </RadioGroup>
        </View>
    )
}

export default CustomRadioGroup

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
})
