import { Select, SelectProps, SelectItem } from '@ui-kitten/components'
import React from 'react'
import { View } from 'react-native'

interface CustomSelectProps extends SelectProps {
    options?: { key: string; value: string }[]
}

const CustomSelect: React.FC<CustomSelectProps> = props => (
    <View>
        <Select {...props}>
            {props.options?.map((option, index) => (
                <SelectItem key={index} title={option.value} />
            ))}
        </Select>
    </View>
)

export default CustomSelect
