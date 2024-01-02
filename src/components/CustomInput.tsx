import { Input, InputProps } from '@ui-kitten/components'
import { isEqual } from 'lodash'
import React from 'react'
import { View, StyleSheet } from 'react-native'

type CustomInputProps = InputProps & {}

const CustomInput: React.FC<CustomInputProps> = props => (
    <View style={style.container}>
        <Input {...props} />
    </View>
)

const arePropsEqual = (
    prevProps: CustomInputProps,
    nextProps: CustomInputProps,
): boolean => isEqual(prevProps, nextProps)

export default React.memo(CustomInput, arePropsEqual)

const style = StyleSheet.create({ container: { width: '100%' } })
