import { Select, SelectProps } from '@ui-kitten/components'
import { isEqual } from 'lodash'
import React, { useEffect } from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'

import CustomHelperText, { helperTextCategory } from './CustomHelperText'

interface CustomSelectProps extends SelectProps {
    style?: ViewStyle
    helperText?: string | { category?: helperTextCategory; text?: string }
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
            <Select {...props}>{props.children}</Select>
            <CustomHelperText
                style={styles.helperText}
                text={actualHelperText}
                category={actualHelperCategory}
            />
        </View>
    )
}

const arePropsEqual = (
    prevProps: CustomSelectProps,
    nextProps: CustomSelectProps,
): boolean => {
    console.log(
        `${prevProps.label} will rerender ${!isEqual(prevProps, nextProps)}`,
    )
    return isEqual(prevProps, nextProps)
}

const styles = StyleSheet.create({
    helperText: {
        marginTop: 0,
    },
})

export default React.memo(CustomSelect, arePropsEqual)
