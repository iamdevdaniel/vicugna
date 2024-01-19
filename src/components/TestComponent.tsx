import React from 'react'
import { Text, View, StyleSheet } from 'react-native'

type TestComponentProps = {
    name: string
    options: { key: string, value: string }[]
}

const TestComponent: React.FC<TestComponentProps> = ({ name, options }) => {

    return <View style={styles.container}>
        <Text>{name}</Text>
        {
            options.map(option => <Text key={option.key}>
                {option.value}
            </Text>)
        }
    </View>
}

export default TestComponent

const styles = StyleSheet.create({
    container: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#80c3ff',
    }
})