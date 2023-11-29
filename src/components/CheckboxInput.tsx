import React from 'react'
import { Field, FieldInputProps } from 'formik'
import { Checkbox, Label, XStack } from 'tamagui'
import { Check as CheckIcon } from '@tamagui/lucide-icons'

interface CheckboxInputProps {
    id: string
    label: string
    name: string
    onChange: (name: string, value: boolean) => void
    size: { checkBox: string; label: string; spacing: string }
}

const CheckboxInput: React.FC<CheckboxInputProps> = ({
    id,
    label,
    name,
    onChange,
    size,
}) => (
    <XStack alignItems="center" space={size.spacing}>
        <Field name={name}>
            {({ field }: { field: FieldInputProps<boolean> }) => {
                const syntheticEvent = {
                    target: {
                        name: field.name,
                        value: !field.value,
                    },
                }

                return (
                    <Checkbox
                        id={id}
                        size={size.checkBox}
                        checked={field.value}
                        onCheckedChange={() => {
                            field.onChange(syntheticEvent)
                            onChange(name, !field.value)
                        }}
                    >
                        <Checkbox.Indicator>
                            <CheckIcon />
                        </Checkbox.Indicator>
                    </Checkbox>
                )
            }}
        </Field>
        <Label size={size.label} htmlFor={id}>
            {label}
        </Label>
    </XStack>
)

export default CheckboxInput
