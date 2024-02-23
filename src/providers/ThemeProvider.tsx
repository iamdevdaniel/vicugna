import * as eva from '@eva-design/eva'
import {
    ApplicationProvider,
    Layout,
    IconRegistry,
} from '@ui-kitten/components'
import { EvaIconsPack } from '@ui-kitten/eva-icons'
import React from 'react'
import { StyleSheet } from 'react-native'

type ThemeProviderProps = {
    children: React.ReactElement
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => (
    <React.Fragment>
        <IconRegistry icons={EvaIconsPack} />
        <ApplicationProvider {...eva} theme={eva.light}>
            <Layout style={styles.layout}>{children}</Layout>
        </ApplicationProvider>
    </React.Fragment>
)

const styles = StyleSheet.create({
    layout: {
        flex: 1,
        justifyContent: 'flex-start',
    },
})

export default ThemeProvider
