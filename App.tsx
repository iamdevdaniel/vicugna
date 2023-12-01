import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Form10 } from './src/components'
import { DefaultTheme, PaperProvider } from 'react-native-paper'

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
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
})

export default App
