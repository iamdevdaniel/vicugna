import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'

import ExtendedSelect from '../components/ExtendedSelect'

const Form10Header: React.FC = () => (
    <View style={styles.container}>
        <ExtendedSelect
            label="Asociación regional"
            value=""
            options={[
                { value: 'Cochabamba', id: '1' },
                { value: 'La Paz', id: '2' },
                { value: 'Oruro', id: '3' },
                { value: 'Potosí', id: '4' },
                { value: 'Tarija', id: '5' },
            ]}
        />
        <Text>BRMC</Text>
    </View>
)

export default Form10Header

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
})
