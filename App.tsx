import { NavigationContainer } from '@react-navigation/native'
import React from 'react'

import ThemeProvider from './src/providers/ThemeProvider'
import MyView from './src/views/ShearingEvenList'

const App: React.FC = () => {
    React.useEffect(() => {
        document.title = 'vicugna'
    }, [])

    return (
        <ThemeProvider>
            <NavigationContainer>
                <MyView />
            </NavigationContainer>
        </ThemeProvider>
    )
}

export default App
