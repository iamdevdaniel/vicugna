import React from 'react'
import { StyleSheet, View } from 'react-native'
import { DefaultTheme, PaperProvider } from 'react-native-paper'

import { Form10 } from './src/views'

const theme = {
    ...DefaultTheme,
    dark: false,
}

const App: React.FC = () => (
    <PaperProvider theme={theme}>
        <View style={styles.container}>
            <Form10 />
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
