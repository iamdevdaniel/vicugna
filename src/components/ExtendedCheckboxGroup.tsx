import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Checkbox, Text, useTheme } from 'react-native-paper'

interface Option {
    name: string
    value: boolean
    label?: string
}

interface ExtendedCheckboxGroupProps {
    options: Option[]
    value: Option[]
    onValueChange: string
    setFieldValue: (field: string, value: unknown) => void
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
                    { backgroundColor: colors.surface, color: colors.primary },
                ]}
            >
                {label}
            </Text>
            <View
                style={[
                    styles.checkboxesContainer,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.outline,
                    },
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
            <Text></Text>
        </View>
    )
}

const areEqual = (
    prevProps: ExtendedCheckboxGroupProps,
    nextProps: ExtendedCheckboxGroupProps,
) => prevProps.value === nextProps.value

const styles = StyleSheet.create({
    checkbox: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        minHeight: 52,
        paddingHorizontal: 16,
    },
    checkboxLabel: {
        fontSize: 16,
    },
    checkboxesContainer: {
        borderRadius: 4,
        borderWidth: 1,
        padding: 8,
    },
    container: {
        paddingTop: 10,
        position: 'relative',
    },
    label: {
        backgroundColor: '#ffffff',
        fontSize: 12,
        left: 10,
        paddingHorizontal: 4,
        position: 'absolute',
        top: 3,
        zIndex: 1,
    },
})

export default React.memo(ExtendedCheckboxGroup, areEqual)
