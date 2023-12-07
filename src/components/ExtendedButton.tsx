import React from 'react'
import { Button, ButtonProps } from 'react-native-paper'

interface ExtendedButtonProps extends ButtonProps {
    onSubmit?: () => void;
}

const ExtendedButton: React.FC<ExtendedButtonProps> = ({ onSubmit, ...props }) => (
    <Button {...props} onPress={() => {
        console.log('ExtendedButton onPress')
        console.log(onSubmit)
        onSubmit && onSubmit()
    }}>{props.children}</Button>
)

const areEqual = (prevProps: ButtonProps, nextProps: ButtonProps) =>
    prevProps.disabled === nextProps.disabled

export default React.memo(ExtendedButton, areEqual)
