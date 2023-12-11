import React, { useState } from 'react'
import { View } from 'react-native'
import { TextInput, List, IconButton } from 'react-native-paper'

interface ExtendedSelectProps {
    options?: { value: string, id: string }[]
    label?: string
    value?: string
}

const ExtendedSelect: React.FC<ExtendedSelectProps> = ({
    options = [],
    label,
    value,
}) => {

    const [selected, setSelected] = useState<string>('')

    return <View>
        <TextInput
            label={label}
            mode='outlined'
            value={value}
            right={<TextInput.Icon icon='chevron-down' />}
        />
        <List.Section>
            {options.map((option, index) => (
                <List.Item
                    key={`${index}-${option.id}`}
                    title={option.value}
                    onPress={() => setSelected(option.id)}
                />
            ))}
        </List.Section>
    </View>
}

export default ExtendedSelect