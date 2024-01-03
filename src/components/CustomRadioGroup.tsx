import { RadioGroup, RadioGroupProps, Radio } from '@ui-kitten/components'
import React from 'react'
import { View, StyleSheet } from 'react-native'

import { option } from '../models'

import CustomLabel from './CustomLabel'

interface CustomRadioGroupProps extends RadioGroupProps {
    label?: string
    options?: option[]
}

const CustomRadioGroup: React.FC<CustomRadioGroupProps> = ({
    options = [],
    label,
    ...props
}) => (
    <View style={styles.container}>
        {label && <CustomLabel text={label} />}
        <RadioGroup {...props}>
            {options.map((option, index) => (
                <Radio key={index}>{option.value}</Radio>
            ))}
        </RadioGroup>
    </View>
)

export default CustomRadioGroup

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
})
