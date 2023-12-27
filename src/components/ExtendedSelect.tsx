import { Select, SelectProps, SelectItem } from '@ui-kitten/components'
import React from 'react'
import { View } from 'react-native'

interface ExtendedSelectProps extends SelectProps {
    options?: { key: string; value: string }[]
}

const ExtendedSelect: React.FC<ExtendedSelectProps> = props => (
    <View>
        <Select {...props}>
            {props.options?.map((option, index) => (
                <SelectItem key={index} title={option.value} />
            ))}
        </Select>
    </View>
)

export default ExtendedSelect
