import React from 'react'
import {
    Input as TamaguiInput,
    InputProps,
    H1,
    H2,
    H3,
    H4,
    H5,
    H6,
} from 'tamagui'

interface WrappedInputProps extends InputProps {
    header?: React.ReactElement<
        typeof H1 | typeof H2 | typeof H3 | typeof H4 | typeof H5 | typeof H6
    >
}

const ExtendedInput: React.FC<WrappedInputProps> = ({ header, ...props }) => (
    <>
        {header}
        <TamaguiInput {...props} />
    </>
)

export default ExtendedInput
