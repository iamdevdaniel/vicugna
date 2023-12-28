import {
    RadioGroup,
    Text,
    RadioGroupProps,
    useTheme,
} from '@ui-kitten/components'
import React from 'react'
import { View, StyleSheet } from 'react-native'

import CustomLabel from './CustomLabel'

interface CustomRadioGroupProps extends RadioGroupProps {
    label?: string
}

const CustomRadioGroup: React.FC<CustomRadioGroupProps> = props => (
    <View style={styles.container}>
        {props.label && <CustomLabel text={props.label} />}
        <RadioGroup {...props}>{props.children}</RadioGroup>
    </View>
)

export default CustomRadioGroup

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
})
