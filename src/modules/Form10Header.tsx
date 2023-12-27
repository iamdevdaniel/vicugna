import { Text, IndexPath } from '@ui-kitten/components'
import React, { useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import ExtendedSelect from '../components/ExtendedSelect'
import { getListOf } from '../models/arcmv'

const Form10Header: React.FC = () => {
    const [selectedDepartment, setSelectedDepartment] = useState('')
    const [selectedRegional, setSelectedRegional] = useState('')
    const [selectedCommunity, setSelectedCommunity] = useState('')

    const departments = getListOf.departments()

    const regionals = useMemo(() => {
        console.log('selectedDepartment', selectedDepartment)
        if (selectedDepartment) {
            return getListOf.regionals(selectedDepartment)
        }
        return []
    }, [selectedDepartment])

    const communities = useMemo(() => {
        if (selectedRegional) {
            return getListOf.communities(selectedRegional, selectedDepartment)
        }
        return []
    }, [selectedRegional])

    return (
        <View style={styles.container}>
            <ExtendedSelect
                placeholder={'Departamento'}
                onSelect={index => {
                    setSelectedDepartment(departments[(index as IndexPath).row].value)
                }}
                options={departments}
            />
            <ExtendedSelect
                placeholder={'Asociación Regional'}
                disabled={!selectedDepartment}
                onSelect={index => {
                    setSelectedRegional(regionals[(index as IndexPath).row].value)
                }}
                options={regionals}
            />
            <ExtendedSelect
                placeholder={'Comunidad'}
                disabled={!selectedRegional}
                onSelect={index => {
                    setSelectedCommunity(communities[(index as IndexPath).row].value)
                }}
                options={communities}
            />
            <Text>BRMC</Text>
        </View>
    )
}

export default Form10Header

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
})
