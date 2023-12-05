import React from 'react'

import { Button, ButtonProps } from 'react-native-paper'

const ExtendedButton: React.FC<ButtonProps> = props => (
    <Button {...props}>{props.children}</Button>
)

const areEqual = (prevProps: ButtonProps, nextProps: ButtonProps) => {
    return prevProps.disabled === nextProps.disabled
}

export default React.memo(ExtendedButton, areEqual)
