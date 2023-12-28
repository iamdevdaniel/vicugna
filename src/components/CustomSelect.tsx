import { Select, SelectProps, SelectItem } from '@ui-kitten/components'
import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'

import CustomHelperText, { helperTextCategory } from './CustomHelperText'

interface CustomSelectProps extends SelectProps {
    style?: ViewStyle
    options?: { key: string; value: string }[]
    helperText?: string | { category?: helperTextCategory; text: string }
}

const CustomSelect: React.FC<CustomSelectProps> = ({
    helperText,
    style: externalStyle,
    ...props
}) => {
    const actualHelperText =
        typeof helperText === 'string' ? helperText : helperText?.text
    const actualHelperCategory =
        typeof helperText === 'string' ? 'default' : helperText?.category

    return (
        <View style={[externalStyle]}>
            <Select {...props}>
                {props.options?.map((option, index) => (
                    <SelectItem key={index} title={option.value} />
                ))}
            </Select>
            <CustomHelperText
                style={styles.helperText}
                text={actualHelperText}
                category={actualHelperCategory}
            />
        </View>
    )
}

export default CustomSelect

const styles = StyleSheet.create({
    helperText: {
        marginTop: 0,
    },
})
