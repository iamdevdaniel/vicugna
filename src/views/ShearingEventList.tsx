import { Button, Icon, IconProps } from '@ui-kitten/components'
import React, { useEffect } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { Form10Header } from 'vicugna-types'

import emptyListImage from '../../assets/paper-sheet.svg'
import SafeLayout from '../components/SafeLayout'
import ShearingEventListEntry from '../components/ShearingEventListEntry'
import StateImage from '../components/StateImage'
import { useNavigation } from '../hooks'
import { getAllFormHeaders } from '../localDB/services/Form10Service'

const ShearingEventList: React.FC = () => {
    const navigator = useNavigation()

    const [headers, setHeaders] = React.useState<Array<Form10Header>>([])

    const populateList = async () => {
        const result = await getAllFormHeaders()
        setHeaders(result)
    }

    useEffect(() => {
        populateList()
    }, [])

    const handlePress = () => {
        navigator.navigate('Form10Header')
    }

    const hasEntries = Boolean(headers.length)
    return (
        <SafeLayout style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {!hasEntries ? (
                    <StateImage
                        source={emptyListImage}
                        label={'Aún no tiene esquilas registradas'}
                    />
                ) : (
                    headers.map(header => (
                        <ShearingEventListEntry
                            style={styles.listItem}
                            key={header.id as number}
                            id={header.id as number}
                            regional={header.regional}
                            community={header.community}
                            captureDate={header.captureDate}
                        />
                    ))
                )}
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
    listItem: {
        marginBottom: 8,
    },
})

export default ShearingEventList
