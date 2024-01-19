import { isEqual } from 'lodash'
import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'

import CustomHelperText, { helperText } from './CustomHelperText'
import CustomLabel from './CustomLabel'

type LabelWithCaptionProps = {
    style?: ViewStyle | ViewStyle[]
    label?: string
    caption?: helperText
    children?: React.ReactNode
}

const LabelWithCaption: React.FC<LabelWithCaptionProps> = props => (
    <View style={[styles.container, props.style]}>
        <CustomLabel text={props.label} style={styles.label} />
        {props.children}
        <CustomHelperText helperText={props.caption} />
    </View>
)

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginTop: 0,
    },
    label: {
        marginBottom: 4,
    },
})

export default React.memo(LabelWithCaption, isEqual)
