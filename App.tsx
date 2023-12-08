import React from 'react'
import { StyleSheet, View } from 'react-native'
import { PaperProvider } from 'react-native-paper'

import customTheme from './src/common/CustomTheme'
import { Form10Entry } from './src/views'

const App: React.FC = () => (
    <PaperProvider theme={customTheme}>
        <View style={styles.container}>
            <Form10Entry />
        </View>
    </PaperProvider>
)

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: 'white',
        flex: 1,
        justifyContent: 'center',
    },
})

export default App
