import { Button, Icon, IconProps, Text } from '@ui-kitten/components'
import React from 'react'
import { View, Image, ScrollView, StyleSheet } from 'react-native'

import emptyListImage from '../../assets/new-file-empty-state.png'

const ShearingEvenList: React.FC = () => (
    <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.imageContainer}>
                <Image style={styles.image} source={emptyListImage} />
            </View>
            <Text>No tiene esquilas registradas</Text>
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
    imageContainer: {
        width: '100%',
        alignItems: 'center',
    },
    image: {
        width: 160,
        height: 160,
        // resizeMode: 'contain'
    },
    button: {
        marginBottom: 0,
    },
})

export default ShearingEvenList
