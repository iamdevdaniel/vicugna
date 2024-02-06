import { Button, Icon, IconProps } from '@ui-kitten/components'
import React from 'react'
import { ScrollView, StyleSheet } from 'react-native'

import emptyListImage from '../../assets/paper-sheet.svg'
import SafeLayout from '../components/SafeLayout'
import StateImage from '../components/StateImage'
import { useNavigation } from '../hooks'

const ShearingEventList: React.FC = () => {
    const navigator = useNavigation()

    const handlePress = () => {
        navigator.navigate('Form10Entry')
    }

    return (
        <SafeLayout style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <StateImage
                    source={emptyListImage}
                    label={'Aún no tiene esquilas registradas'}
                />
            </ScrollView>
            <Button
                style={styles.button}
                accessoryRight={(props: IconProps) => (
                    <Icon {...props} name="plus-outline" />
                )}
                onPress={handlePress}
            >
                Nueva Esquila
            </Button>
        </SafeLayout>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 8,
    },
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        marginBottom: 0,
    },
})

export default ShearingEventList
