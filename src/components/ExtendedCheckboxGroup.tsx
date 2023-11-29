import React, { ReactElement } from 'react'
import { XGroup, H1, H2, H3, H4, H5, H6 } from 'tamagui'

interface ExtendedCheckboxGroupProps {
    children?: React.ReactNode
    header?: ReactElement<
        typeof H1 | typeof H2 | typeof H3 | typeof H4 | typeof H5 | typeof H6
    >
}

const ExtendedCheckboxGroup: React.FC<ExtendedCheckboxGroupProps> = ({
    children,
    header,
}) => (
    <>
        {header}
        <XGroup>
            {React.Children.map(children, child => (
                <XGroup.Item>{child}</XGroup.Item>
            ))}
        </XGroup>
    </>
)

export default ExtendedCheckboxGroup
