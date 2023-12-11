import React from 'react'
import { View } from 'react-native'
import { TextInput as RNTextInput } from 'react-native'
import { TextInput, List, useTheme, Button, Text } from 'react-native-paper'

import ExtendedTextInput from './ExtendedTextInput'

interface ExtendedSelectProps {
    options?: { value: string; id: string }[]
    label?: string
    value?: string
    placeholder?: string
}

const ExtendedSelect: React.FC<ExtendedSelectProps> = ({
    options = [],
    label,
    value,
    placeholder,
}) => {
    const { colors } = useTheme()
    const [isListVisible, setIsListVisible] = React.useState<boolean>(false)
    const inputRef = React.useRef<RNTextInput | null>(null)

    return (
        <View style={{ position: 'relative', zIndex: 1 }}>
            <ExtendedTextInput
                placeholder={placeholder}
                ref={inputRef}
                label={label}
                value={value}
                mode="outlined"
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
                    <View style={{ marginVertical: -8 }}>
                        <List.Section
                            style={{
                                paddingVertical: 0,
                                paddingTop: 0,
                                paddingBottom: 0,
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

                    <View style={{ alignItems: 'center' }}>
                        <Button onPress={() => setIsListVisible(false)}>
                            <Text
                                style={{
                                    color: colors.onPrimary,
                                    fontSize: 16,
                                }}
                            >
                                {'Cerrar'}
                            </Text>
                        </Button>
                    </View>
                </View>
            )}
        </View>
    )
}

export default ExtendedSelect
