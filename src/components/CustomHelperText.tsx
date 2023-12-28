import { Text, useTheme } from '@ui-kitten/components'
import React from 'react'
import { ViewStyle, StyleSheet } from 'react-native'

export type helperTextCategory = 'default' | 'info' | 'danger'

export type CustomHelperTextProps = {
    style?: ViewStyle
    category?: helperTextCategory
    text?: string
}

const CustomHelperText: React.FC<CustomHelperTextProps> = ({
    category = 'default',
    text,
    style: externalStyle,
}) => {
    const theme = useTheme()

    const categoryMap = {
        default: theme['text-hint-color'],
        info: theme['text-info-color'],
        danger: theme['text-danger-color'],
    }

    return (
        <Text
            style={[
                externalStyle,
                style.container,
                {
                    color: categoryMap[category],
                },
            ]}
        >
            {text}
        </Text>
    )
}

export default CustomHelperText

const style = StyleSheet.create({
    container: {
        width: '100%',
        fontSize: 12,
    },
})
