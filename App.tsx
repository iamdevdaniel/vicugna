import * as eva from '@eva-design/eva'
import { ApplicationProvider, Layout } from '@ui-kitten/components'
import React from 'react'
import { StyleSheet } from 'react-native'

import { Form10Entry } from './src/modules'

const App: React.FC = () => (
    <ApplicationProvider {...eva} theme={eva.light}>
        <Layout style={styles.layout}>
            {/* <Form10Header /> */}
            <Form10Entry />
        </Layout>
    </ApplicationProvider>
)

const styles = StyleSheet.create({
    layout: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})

export default App
