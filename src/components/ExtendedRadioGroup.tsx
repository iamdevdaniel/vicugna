import React from 'react'
import { StyleSheet, View } from 'react-native'
import { HelperText, RadioButton, Text, useTheme } from 'react-native-paper'
import { CustomTheme } from 'src/models'
interface ExtendedRadioGroupProps {
    onValueChange: (value: string) => void
    value: string
    options: { label: string; value: string }[]
    label: string
    errorMessage?: string
}

const ExtendedRadioGroup: React.FC<ExtendedRadioGroupProps> = ({
    onValueChange,
    value,
    options,
    label,
    errorMessage,
}) => {
    const { colors } = useTheme() as CustomTheme

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
                    styles.radioGroupContainer,
                    {
                        backgroundColor: colors.surface,
                        borderColor: hasError
                            ? colors.red?.[500]
                            : colors.outline,
                    },
                ]}
            >
                <RadioButton.Group onValueChange={onValueChange} value={value}>
                    {options.map(option => (
                        <RadioButton.Item
                            key={option.value}
                            label={option.label}
                            value={option.value}
                        />
                    ))}
                </RadioButton.Group>
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
    prevProps: ExtendedRadioGroupProps,
    nextProps: ExtendedRadioGroupProps,
) =>
    prevProps.value === nextProps.value &&
    prevProps.errorMessage === nextProps.errorMessage

const styles = StyleSheet.create({
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
    radioGroupContainer: {
        borderRadius: 4,
        borderWidth: 1,
        padding: 8,
    },
})

export default React.memo(ExtendedRadioGroup, areEqual)
