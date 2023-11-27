import React, { FC } from 'react'
import { StyleSheet, View } from 'react-native'
import { Form10 } from './src/components'
import { TamaguiProvider } from 'tamagui'
import tamaguiConfig from './tamagui.config'

const App: FC = () => {
    return (
        <TamaguiProvider config={tamaguiConfig}>
            <View style={styles.container}>
                <Form10 />
            </View>
        </TamaguiProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
})

export default App