import { Select, SelectProps, SelectItem } from '@ui-kitten/components'
import { isEqual } from 'lodash'
import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'

type CustomSelectProps = SelectProps & {
    style?: ViewStyle
    options: { key: string; value: string }[]
}

const CustomSelect: React.FC<CustomSelectProps> = ({
    style: externalStyle,
    ...props
}) => (
    <View style={[styles.container, externalStyle]}>
        <Select {...props}>
            {props.options.map((option, index) => (
                <SelectItem key={index} title={option.value} />
            ))}
        </Select>
    </View>
)

const arePropsEqual = (
    prevProps: CustomSelectProps,
    nextProps: CustomSelectProps,
): boolean => {
    const propsToCheck: Array<keyof CustomSelectProps> = [
        'label',
        'value',
        'options',
        'placeholder',
        'status',
        'disabled',
    ]

    return propsToCheck.every(prop => isEqual(prevProps[prop], nextProps[prop]))
}

const styles = StyleSheet.create({
    container: {},
})

export default React.memo(CustomSelect, arePropsEqual)
