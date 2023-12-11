import React from 'react'
import { View } from 'react-native'
import { TextInput, List, useTheme } from 'react-native-paper'

import ExtendedTextInput from './ExtendedTextInput'

interface ExtendedSelectProps {
    options?: { value: string; id: string }[]
    label?: string
    value?: string
}

const ExtendedSelect: React.FC<ExtendedSelectProps> = ({
    options = [],
    label,
    value,
}) => {
    const { colors } = useTheme()
    const [isListVisible, setIsListVisible] = React.useState<boolean>(false)

    return (
        <View style={{ position: 'relative', zIndex: 1 }}>
            <ExtendedTextInput
                label={label}
                mode="outlined"
                value={value}
                right={
                    <TextInput.Icon
                        icon={isListVisible ? 'chevron-up' : 'chevron-down'}
                        onPress={() => setIsListVisible(true)}
                    />
                }
                onFocus={() => setIsListVisible(true)}
                onBlur={() => setIsListVisible(false)}
            />
            {isListVisible && (
                <View
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: '100%',
                        marginVertical: -8,
                        borderRadius: 5,
                        backgroundColor: colors.onSurfaceVariant,
                        overflow: 'hidden',
                    }}
                >
                    <List.Section
                        style={{
                            paddingVertical: 0,
                        }}
                    >
                        {options.map((option, index) => (
                            <List.Item
                                titleStyle={{ color: colors.onSecondary }}
                                key={`${index}-${option.id}`}
                                title={option.value}
                                style={{
                                    borderBottomWidth:
                                        index < options.length - 1 ? 1 : 0,
                                    borderBottomColor: colors.primary,
                                }}
                            />
                        ))}
                    </List.Section>
                </View>
            )}
        </View>
    )
}

export default ExtendedSelect
