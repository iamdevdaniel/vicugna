import { Text, useTheme } from '@ui-kitten/components'
import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'

interface CustomLabelProps {
    style?: ViewStyle
    text?: string
}

const CustomLabel: React.FC<CustomLabelProps> = ({
    text,
    style: externalStyle,
}) => {
    const theme = useTheme()

    return (
        <View style={[styles.container, externalStyle]}>
            <Text
                category="label"
                style={[{ color: theme['color-basic-600'] }]}
            >
                {text}
            </Text>
        </View>
    )
}

const arePropsEqual = (
    prevProps: CustomLabelProps,
    nextProps: CustomLabelProps,
): boolean => prevProps.text !== nextProps.text

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
})

export default React.memo(CustomLabel, arePropsEqual)
