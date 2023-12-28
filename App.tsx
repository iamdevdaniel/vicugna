import * as eva from '@eva-design/eva'
import { ApplicationProvider, Layout } from '@ui-kitten/components'
import React from 'react'
import { StyleSheet } from 'react-native'

import Form10Header from './src/modules/Form10Header'

const App: React.FC = () => (
    <ApplicationProvider {...eva} theme={eva.light}>
        <Layout style={styles.layout}>
            <Form10Header />
        </Layout>
    </ApplicationProvider>
)

const styles = StyleSheet.create({
    layout: {
        flex: 1,
        justifyContent: 'flex-start',
    },
})

export default App
