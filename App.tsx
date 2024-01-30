import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Layout, useTheme } from '@ui-kitten/components'
import React from 'react'

import RootStackParamList from './src/common/navigationTypes'
import Form10Entry from './src/modules/Form10Entry'
import Form10Header from './src/modules/Form10Header'
import AppProviders from './src/providers/AppProviders'
import { AppContext } from './src/providers/ContextProvider'
import ShearingEventList from './src/views/ShearingEventList'

const App: React.FC = () => {
    React.useEffect(() => {
        document.title = 'vicugna'
    }, [])

    const Stack = createNativeStackNavigator<RootStackParamList>()

    return (
        <AppProviders>
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName="ShearingEventList"
                    screenOptions={{ headerShown: false }}
                >
                    <Stack.Screen
                        name="ShearingEventList"
                        component={ShearingEventList}
                    />
                    <Stack.Screen
                        name="Form10Header"
                        component={Form10Header}
                    />
                    <Stack.Screen name="Form10Entry" component={Form10Entry} />
                </Stack.Navigator>
            </NavigationContainer>
        </AppProviders>
    )
}

export default App
