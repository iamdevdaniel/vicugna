import { Text, useTheme } from '@ui-kitten/components'
import React from 'react'
import { ViewStyle, StyleSheet } from 'react-native'

export type helperTextCategory = 'default' | 'info' | 'danger'
export type helperText =
    | string
    | { category: helperTextCategory; text?: string }

export type CustomHelperTextProps = {
    style?: ViewStyle
    helperText?: helperText
}

const CustomHelperText: React.FC<CustomHelperTextProps> = ({
    style: externalStyle,
    helperText,
}) => {
    const theme = useTheme()

    const actualText =
        typeof helperText === 'string' ? helperText : helperText?.text
    const actualCategory =
        typeof helperText === 'string' ? 'default' : helperText?.category

    const categoryMap = {
        default: theme['text-hint-color'],
        info: theme['text-info-color'],
        danger: theme['text-danger-color'],
    }

    return helperText ? (
        <Text
            style={[
                externalStyle,
                style.container,
                {
                    color: categoryMap[actualCategory || 'default'],
                },
            ]}
        >
            {actualText}
        </Text>
    ) : (
        <React.Fragment />
    )
}

export default CustomHelperText

const style = StyleSheet.create({
    container: {
        width: '100%',
        fontSize: 12,
    },
})
