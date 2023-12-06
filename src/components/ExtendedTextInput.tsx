import React from 'react'
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

const ExtendedTextInput: React.FC<ExtendedTextInputProps> = ({
    errorMessage,
    ...props
}) => {
    const hasError = !!errorMessage

    const { colors } = useTheme() as CustomTheme

    return (
        <>
            <TextInput
                {...props}
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
}

export default ExtendedTextInput
