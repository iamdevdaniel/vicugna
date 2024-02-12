import { Text } from '@ui-kitten/components'
import React from 'react'
import {
    Image,
    ImageStyle,
    ImageSourcePropType,
    View,
    StyleSheet,
} from 'react-native'

type StateImageProps = {
    source?: ImageSourcePropType
    label?: string
    style?: ImageStyle
}

const StateImage: React.FC<StateImageProps> = ({ source, label, style }) => (
    <React.Fragment>
        <View style={styles.container}>
            <Image style={[styles.image, style]} source={source} />
        </View>
        <Text
            style={[
                styles.label,
                {
                    textAlign: 'center',
                },
            ]}
            appearance="hint"
        >
            {label}
        </Text>
    </React.Fragment>
)

export default StateImage

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
    },
    image: {
        width: 220,
        height: 220,
    },
    label: {
        minWidth: 240,
        maxWidth: 260,
    },
})
