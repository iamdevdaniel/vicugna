import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import Form10Entry from './src/modules/Form10Entry'
import Form10Header from './src/modules/Form10Header'
import AppProviders from './src/providers/AppProviders'
import { AppContext } from './src/providers/ContextProvider'
import ShearingEventList from './src/views/ShearingEventList'

const Stack = createStackNavigator()

const App: React.FC = () => {
    React.useEffect(() => {
        document.title = 'vicugna'
    }, [])

    const context = React.useContext(AppContext)

    return (
        <AppProviders>
            <ShearingEventList />
            {/* <NavigationContainer>
                <Stack.Navigator
                    initialRouteName={context.viewNames.shearingEventList}
                >
                    <Stack.Screen
                        name={context.viewNames.shearingEventList}
                        component={ShearingEventList}
                    />
                    <Stack.Screen
                        name={context.viewNames.form10Entry}
                        component={Form10Header}
                    />
                    <Stack.Screen
                        name={context.viewNames.form10Header}
                        component={Form10Entry}
                    />
                </Stack.Navigator>
            </NavigationContainer> */}
        </AppProviders>
    )
}

export default App
