import * as eva from '@eva-design/eva'
import { ApplicationProvider, Layout } from '@ui-kitten/components'
import React from 'react'
import { StyleSheet } from 'react-native'

import Form10 from './src/modules/Form10Header'

const App: React.FC = () => (
    <ApplicationProvider {...eva} theme={eva.light}>
        <Layout style={styles.layout}>
            <Form10 />
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
