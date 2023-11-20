
import React, { FC } from 'react'
import { View, Text, TextInput, Button } from 'react-native'

const Form: FC = () => {
    return (
        <View>
            <Text>Form Component</Text>
            <TextInput placeholder="Enter your name" />
            <Button title="Submit" onPress={() => { }} />
        </View>
    )
}

export default Form
