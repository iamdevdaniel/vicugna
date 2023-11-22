import React, { FC } from "react"
import { View } from "react-native"
import { Button, TextInput } from "react-native"
import withCoreForm, { WrappedFormProps } from "./withCoreForm"

const Form10: FC<WrappedFormProps> = ({ formData, onInputChange, onSubmit }) => {

    const handleSubmit = () => {
        onSubmit(formData)
    }

    return (
        <View>
            <TextInput
                placeholder="Enter name"
                onChangeText={(value) => onInputChange('name', value)}
            />
            <TextInput
                placeholder="Enter email"
                onChangeText={(value) => onInputChange('email', value)}
            />
            <Button title="Submit" onPress={handleSubmit} />
        </View>
    )
}

export default withCoreForm(Form10)