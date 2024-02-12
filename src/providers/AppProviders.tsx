import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import ContextProvider from './ContextProvider'
import ThemeProvider from './ThemeProvider'

type AppProvidersProps = {
    children: React.ReactNode
}

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
    const providers = [ContextProvider, SafeAreaProvider, ThemeProvider]

    return providers.reduce(
        (previousValue, CurrentProvider) => (
            <CurrentProvider>
                {previousValue as React.ReactElement}
            </CurrentProvider>
        ),
        children,
    )
}

export default AppProviders
