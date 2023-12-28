import {
    RadioGroup,
    Text,
    RadioGroupProps,
    useTheme,
} from '@ui-kitten/components'
import React from 'react'
import { View, StyleSheet } from 'react-native'

interface CustomRadioGroupProps extends RadioGroupProps {
    label?: string
}

const CustomRadioGroup: React.FC<CustomRadioGroupProps> = props => {
    const theme = useTheme()

    return (
        <View style={styles.container}>
            {props.label && (
                <Text
                    category="label"
                    style={[styles.label, { color: theme['color-basic-600'] }]}
                >
                    {props.label}
                </Text>
            )}
            <RadioGroup {...props}>{props.children}</RadioGroup>
        </View>
    )
}

export default CustomRadioGroup

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    label: {},
})