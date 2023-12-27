import {
    Select,
    SelectProps,
    SelectItem,
    IndexPath,
} from '@ui-kitten/components'
import React, { useState } from 'react'
import { View } from 'react-native'

interface ExtendedSelectProps extends SelectProps {
    options?: { key: string; value: string }[]
}

const ExtendedSelect: React.FC<ExtendedSelectProps> = props => {
    const [selectedIndex, setSelectedIndex] = useState<IndexPath | IndexPath[]>(
        [],
    )

    const displayValue = Array.isArray(selectedIndex)
        ? selectedIndex
              .map(index =>
                  props.options ? props.options[index.row].value : '',
              )
              .join(', ')
        : selectedIndex && props.options
          ? props.options[selectedIndex.row].value
          : ''

    return (
        <View>
            <Select
                {...props}
                selectedIndex={selectedIndex}
                onSelect={index => {
                    setSelectedIndex(index)
                    if (typeof props.onSelect === 'function') {
                        props.onSelect(index)
                    }
                }}
                value={displayValue}
            >
                {props.options?.map((option, index) => (
                    <SelectItem key={index} title={option.value} />
                ))}
            </Select>
        </View>
    )
}

export default ExtendedSelect
