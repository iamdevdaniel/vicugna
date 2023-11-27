import React from 'react'
import { Label, RadioGroup, SizeTokens, XStack, YStack } from 'tamagui'

type RadioGroupItemProps = {
    size: SizeTokens;
    value: string;
    label: string;
}

const RadioGroupItem: React.FC<RadioGroupItemProps> = ({
    size,
    value,
    label
}) => {
    const id = `radiogroup-${value}`
    return (
        <XStack width={300} alignItems="center" space="$4">
            <RadioGroup.Item value={value} id={id} size={size}>
                <RadioGroup.Indicator />
            </RadioGroup.Item>

            <Label size={size} htmlFor={id}>
                {label}
            </Label>
        </XStack>
    )
}

export default RadioGroupItem