import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Layout, useTheme } from '@ui-kitten/components'
import React from 'react'

import Form10Entry from './src/modules/Form10Entry'
import AppProviders from './src/providers/AppProviders'
import { AppContext } from './src/providers/ContextProvider'
import ShearingEventList from './src/views/ShearingEventList'

const App: React.FC = () => {
    React.useEffect(() => {
        document.title = 'vicugna'
    }, [])

    const { viewNames } = React.useContext(AppContext)
    const Stack = createNativeStackNavigator()
    const theme = useTheme()

    return (
        <AppProviders>
            {/* <Form10Entry /> */}
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen name="Home" component={Form10Entry} />
                </Stack.Navigator>
            </NavigationContainer>
        </AppProviders>
    )
}

export default App
