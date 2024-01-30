import React from 'react'

import ContextProvider from './ContextProvider'
import ThemeProvider from './ThemeProvider'

type AppProvidersProps = {
    children: React.ReactNode
}

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
    const providers = [ContextProvider, ThemeProvider]

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
