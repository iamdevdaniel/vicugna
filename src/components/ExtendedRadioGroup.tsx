import { View, StyleSheet } from 'react-native'
import { RadioButton, Text, useTheme } from 'react-native-paper'
import { isEqual } from 'lodash'
import React from 'react'
interface ExtendedRadioGroupProps {
    onValueChange: (value: string) => void
    value: string
    options: { label: string; value: string }[]
    label: string
}

const ExtendedRadioGroup: React.FC<ExtendedRadioGroupProps> = ({
    onValueChange,
    value,
    options,
    label,
}) => {
    const { colors } = useTheme()

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
                    styles.radioGroupContainer,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.outline,
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
        </View>
    )
}

const areEqual = (
    prevProps: ExtendedRadioGroupProps,
    nextProps: ExtendedRadioGroupProps,
) => prevProps.value === nextProps.value

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
    radioGroupContainer: {
        borderWidth: 1,
        borderRadius: 4,
        padding: 8,
    },
})

export default React.memo(ExtendedRadioGroup, areEqual)
