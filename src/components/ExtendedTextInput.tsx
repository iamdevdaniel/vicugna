import React from 'react'
import { TextInput as RNTextInput } from 'react-native'
import {
    TextInput,
    TextInputProps,
    HelperText,
    useTheme,
} from 'react-native-paper'
import { CustomTheme } from 'src/models'

interface ExtendedTextInputProps extends TextInputProps {
    errorMessage?: string
}

const ExtendedTextInput = React.forwardRef<RNTextInput, ExtendedTextInputProps>(
    ({ errorMessage, ...props }, ref) => {
        const hasError = !!errorMessage

        const { colors } = useTheme() as CustomTheme

        return (
            <>
                <TextInput
                    {...props}
                    ref={ref}
                    error={hasError}
                    outlineStyle={{ borderWidth: 1 }}
                />
                <HelperText
                    type="error"
                    visible={hasError}
                    style={{ backgroundColor: colors.red?.[50] }}
                >
                    {errorMessage}
                </HelperText>
            </>
        )
    },
)

export default ExtendedTextInput
