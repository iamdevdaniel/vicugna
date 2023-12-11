import React from 'react';
import { StyleSheet, View } from 'react-native';
import ExtendedSelect from '../components/ExtendedSelect';

const Form10Header: React.FC = () => {
    return (
        <View style={styles.container}>
            <ExtendedSelect
                label='Asociación regional'
                value=''
            >
            </ExtendedSelect>
        </View>
    );
};

export default Form10Header;

const styles = StyleSheet.create({
    container: {
        width: '100%'
    },
})