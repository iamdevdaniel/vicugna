import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native'
import ExtendedButton from '../components/ExtendedButton';
import ExtendedSelect from '../components/ExtendedSelect';

const Form10Header: React.FC = () => {
    return (
        <View style={styles.container}>
            <ExtendedSelect
                label='Seleccione una opción'
                arrayList={[
                    { value: 'Option 1', _id: '1' },
                    { value: 'Option 2', _id: '2' },
                ]}
                multiEnable={false}
                value=''
                selectedArrayList={[]}
                onSelection={() => { }}
                hideSearchBox={true}
                dialogCloseButtonText='Cerrar'
                dialogDoneButtonText='Listo'
            >

            </ExtendedSelect>

            <ExtendedButton>
                <Text>Submit</Text>
            </ExtendedButton>
        </View>
    );
};

export default Form10Header;


const styles = StyleSheet.create({
    container: {
        width: '100%'
    },
})