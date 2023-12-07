import React from 'react'
import { StyleSheet, ViewStyle } from 'react-native'
import { Button, ButtonProps, useTheme } from 'react-native-paper'
import { CustomTheme } from 'src/models'

interface ExtendedButtonProps extends ButtonProps {
    onSubmit?: () => void
    type?: 'submit'
}

const ExtendedButton: React.FC<ExtendedButtonProps> = ({
    onSubmit,
    type,
    ...props
}) => {
    const { colors } = useTheme() as CustomTheme

    const StyleSelector: Record<string, ViewStyle | ViewStyle[]> = {
        submit: [styles.submit, { backgroundColor: colors.blue?.[500] }],
    }

    return (
        <Button
            {...props}
            onPress={() => {
                onSubmit && onSubmit()
            }}
            style={type && StyleSelector[type]}
        >
            {props.children}
        </Button>
    )
}

const areEqual = (prevProps: ButtonProps, nextProps: ButtonProps) =>
    prevProps.disabled === nextProps.disabled

export default React.memo(ExtendedButton, areEqual)

const styles = StyleSheet.create({
    submit: {
        borderRadius: 5,
    },
})
