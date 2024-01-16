import React from 'react'
import { CheckBox, CheckBoxProps } from '@ui-kitten/components'
import { View, StyleSheet } from 'react-native'

type CustomCheckboxProps = Omit<CheckBoxProps, 'onChange'> & {
    label?: string
    onChange?: (value: boolean) => void
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ label, onChange, ...props }) => {

    return <View style={styles.container}>
        <CheckBox
            {...props}
            onChange={(isChecked: boolean) => {
                if (onChange) {
                    onChange(isChecked)
                }
            }}
        >
            {label}
        </CheckBox>
    </View>
}

export default CustomCheckbox

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 8
    }
})