import { Select, SelectProps } from '@ui-kitten/components'
import { isEqual } from 'lodash'
import React from 'react'
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
    if (!isEqual(prevProps.style, nextProps.style)) {
        if (nextProps.label === 'Departamento') console.log('Dep. style changed');
    }

    if (!isEqual(prevProps.helperText, nextProps.helperText)) {
        if (nextProps.label === 'Departamento') console.log('Dep. helperText changed');
    }

    if (!isEqual(prevProps.children, nextProps.children)) {
        if (nextProps.label === 'Departamento') console.log('Dep. children changed');
    }

    return isEqual(prevProps, nextProps)
}

const styles = StyleSheet.create({
    helperText: {
        marginTop: 0,
    },
})

export default React.memo(CustomSelect, arePropsEqual)
