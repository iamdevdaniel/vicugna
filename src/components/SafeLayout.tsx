import { Layout } from '@ui-kitten/components'
import React from 'react'
import { StyleSheet, ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type SafeLayoutProps = {
    children: React.ReactNode
    style?: ViewStyle
}

const SafeLayout: React.FC<SafeLayoutProps> = ({ children, style }) => (
    <SafeAreaView style={styles.safeArea}>
        <Layout style={[styles.layout, style]}>{children}</Layout>
    </SafeAreaView>
)

export default SafeLayout

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    layout: { flex: 1 },
})
