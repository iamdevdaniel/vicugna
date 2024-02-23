import { Text, Layout, Icon, useTheme } from '@ui-kitten/components'
import React from 'react'
import { StyleSheet, ViewStyle } from 'react-native'

import formatDate from '../utilities/formatDate'

type ShearingEventListEntryProps = {
    style?: ViewStyle
    id: number
    regional: string
    community: string
    captureDate: string
}

const ShearingEventListEntry: React.FC<ShearingEventListEntryProps> = ({
    style: extrenalStyle,
    id,
    regional,
    community,
    captureDate,
}) => {
    const theme = useTheme()
    const formattedDate = formatDate(captureDate)

    return (
        <Layout
            style={[
                extrenalStyle,
                styles.container,
                {
                    backgroundColor: theme['background-basic-color-2'],
                    borderColor:
                        theme['color-basic-transparent-default-border'],
                    borderWidth: 1,
                },
            ]}
        >
            <Layout style={styles.prefix}>
                <Text style={styles.id}>#{id}</Text>
            </Layout>
            <Layout style={styles.body}>
                <Text style={styles.title}>{`${regional}, ${community}`}</Text>
                <Text>{formattedDate}</Text>
            </Layout>

            <Layout style={styles.suffix}>
                <Icon
                    style={[styles.icon, styles.iconLeft]}
                    name="edit-2-outline"
                    fill={theme['text-hint-color']}
                />
                <Icon
                    style={styles.icon}
                    name="trash-2-outline"
                    fill={theme['text-hint-color']}
                />
            </Layout>
        </Layout>
    )
}

export default ShearingEventListEntry

const consts = {
    height: 80,
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderRadius: 8,
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'crimson',
    },
    prefix: {
        aspectRatio: 1,
        height: consts.height,
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    id: {
        textAlign: 'center',
        fontSize: 34,
    },
    body: {
        flex: 1,
        flexDirection: 'column',
        marginHorizontal: 12,
        justifyContent: 'space-evenly',
        height: consts.height,
        backgroundColor: 'transparent',
    },
    title: {
        fontWeight: 'bold',
    },
    suffix: {
        flexDirection: 'row',
        alignItems: 'center',
        height: '100%',
        marginRight: 8,
        backgroundColor: 'transparent',
    },
    icon: { aspectRatio: 1, width: 32 },
    iconLeft: { marginRight: 4 },
})
