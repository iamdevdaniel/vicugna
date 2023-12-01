import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Checkbox, useTheme, Text } from 'react-native-paper'

interface Option {
    name: string
    value: boolean
    label?: string
}

interface ExtendedCheckboxGroupProps {
    options: Option[]
    value: Option[]
    onValueChange: string
    setFieldValue: (field: string, value: any) => void
    label: string
}

const ExtendedCheckboxGroup: React.FC<ExtendedCheckboxGroupProps> = ({
    options,
    value,
    onValueChange,
    setFieldValue,
    label,
}) => {
    const { colors } = useTheme()

    const handlePress = (name: string) => {
        const newValues = value.map(item =>
            item.name === name ? { ...item, value: !item.value } : item,
        )
        setFieldValue(onValueChange, newValues)
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
                    styles.checkboxesContainer,
                    { backgroundColor: colors.surface },
                ]}
            >
                {options.map(option => (
                    <View key={option.name} style={styles.checkbox}>
                        <Text style={styles.checkboxLabel}>{option.label}</Text>
                        <Checkbox
                            status={
                                value.find(item => item.name === option.name)
                                    ?.value
                                    ? 'checked'
                                    : 'unchecked'
                            }
                            onPress={() => handlePress(option.name)}
                        />
                    </View>
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
    checkboxesContainer: {
        borderWidth: 1,
        borderRadius: 4,
        padding: 8,
    },
    checkboxLabel: {
        fontSize: 16,
    },
    checkbox: {
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
})

export default ExtendedCheckboxGroup
