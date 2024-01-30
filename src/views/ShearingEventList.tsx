import { Button, Icon, IconProps } from '@ui-kitten/components'
import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'

import emptyListImage from '../../assets/paper-sheet.svg'
import StateImage from '../components/StateImage'

const ShearingEventList: React.FC = () => (
    <View style={styles.container}>
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
        >
            Nueva Esquila
        </Button>
    </View>
)

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
