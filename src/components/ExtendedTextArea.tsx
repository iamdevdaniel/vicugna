import React, { ReactElement } from 'react'
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

interface ExtendedInputProps extends InputProps {
    label: string
    header?: ReactElement<
        typeof H1 | typeof H2 | typeof H3 | typeof H4 | typeof H5 | typeof H6
    >
}

const ExtendedInput: React.FC<ExtendedInputProps> = ({ header, ...props }) => (
    <>
        {header}
        <TamaguiInput {...props} />
    </>
)

export default ExtendedInput
