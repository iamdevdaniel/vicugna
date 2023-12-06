import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Checkbox, Text, useTheme, HelperText } from 'react-native-paper'
import { CustomTheme } from 'src/models'

interface Option {
    label?: string
    name: string
    value: boolean
}

interface ExtendedCheckboxGroupProps {
    errorMessage?: string
    label: string
    onValueChange: string
    options: Option[]
    setFieldValue: (field: string, value: unknown) => void
    value: Option[]
}

const ExtendedCheckboxGroup: React.FC<ExtendedCheckboxGroupProps> = ({
    errorMessage,
    label,
    onValueChange,
    options,
    setFieldValue,
    value,
}) => {
    const { colors } = useTheme() as CustomTheme

    const handlePress = (name: string) => {
        const newValues = value.map(item =>
            item.name === name ? { ...item, value: !item.value } : item,
        )
        setFieldValue(onValueChange, newValues)
    }

    const hasError = !!errorMessage

    return (
        <View style={styles.container}>
            <Text
                style={[
                    styles.label,
                    {
                        backgroundColor: colors.surface,
                        color: hasError ? colors.red?.[500] : colors.primary,
                    },
                ]}
            >
                {label}
            </Text>
            <View
                style={[
                    styles.checkboxesContainer,
                    {
                        backgroundColor: colors.surface,
                        borderColor: hasError
                            ? colors.red?.[500]
                            : colors.outline,
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
            <HelperText
                type="error"
                visible={hasError}
                style={{ backgroundColor: colors.red?.[50] }}
            >
                {errorMessage}
            </HelperText>
        </View>
    )
}

const areEqual = (
    prevProps: ExtendedCheckboxGroupProps,
    nextProps: ExtendedCheckboxGroupProps,
) =>
    prevProps.value === nextProps.value &&
    prevProps.errorMessage === nextProps.errorMessage

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
        fontSize: 12,
        left: 10,
        paddingHorizontal: 4,
        position: 'absolute',
        top: 3,
        zIndex: 1,
    },
})

export default React.memo(ExtendedCheckboxGroup, areEqual)
