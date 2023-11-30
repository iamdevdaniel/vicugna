import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Form10 } from './src/components'

const App: React.FC = () => (
    <View style={styles.container}>
        <Form10 />
    </View>
)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
})

export default App
