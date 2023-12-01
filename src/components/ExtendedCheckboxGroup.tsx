// ExtendedCheckboxGroup.tsx
import { View, StyleSheet } from 'react-native'
import { Checkbox, Text, useTheme } from 'react-native-paper'
import React, { useState } from 'react'

interface ExtendedCheckboxGroupProps {
    onValueChange: (value: string[]) => void
    value: string[]
    options: { label: string; value: string }[]
    label: string
}

const ExtendedCheckboxGroup: React.FC<ExtendedCheckboxGroupProps> = ({
    onValueChange,
    value,
    options,
    label,
}) => {
    const { colors } = useTheme()

    const handleValueChange = (optionValue: string) => {
        const newValue = value.includes(optionValue)
            ? value.filter(v => v !== optionValue)
            : [...value, optionValue]
        onValueChange(newValue)
    }

    return (
        <View style={styles.container}>
            <Text
                style={[
                    styles.label,
                    { color: colors.primary, backgroundColor: colors.surface },
                ]}
            >
                {label}
            </Text>
            <View
                style={[
                    styles.checkboxGroupContainer,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.outline,
                    },
                ]}
            >
                {options.map(option => (
                    <Checkbox.Item
                        key={option.value}
                        label={option.label}
                        status={
                            value.includes(option.value)
                                ? 'checked'
                                : 'unchecked'
                        }
                        onPress={() => handleValueChange(option.value)}
                    />
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        paddingTop: 10,
    },
    label: {
        position: 'absolute',
        paddingHorizontal: 4,
        top: 3,
        left: 10,
        zIndex: 1,
        backgroundColor: '#ffffff',
        fontSize: 12,
    },
    checkboxGroupContainer: {
        borderWidth: 1,
        borderRadius: 4,
        padding: 8,
    },
})

export default ExtendedCheckboxGroup
