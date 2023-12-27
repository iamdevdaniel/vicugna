import { Text } from '@ui-kitten/components'
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
    }, [selectedRegional, selectedDepartment])

    return (
        <View style={styles.container}>
            <ExtendedSelect
                placeholder={'Departamento'}
                onSelect={index => {
                    console.log('onSelect triggered', index)
                    if (!Array.isArray(index)) {
                        setSelectedDepartment(departments[index.row].value)
                    }
                }}
                options={departments}
            />
            <ExtendedSelect
                placeholder={'Asociación Regional'}
                disabled={!selectedDepartment}
                onSelect={index => {
                    if (!Array.isArray(index)) {
                        setSelectedRegional(regionals[index.row].value)
                    }
                }}
                options={regionals}
            />
            <ExtendedSelect
                placeholder={'Comunidad'}
                disabled={!selectedRegional}
                onSelect={index => {
                    if (!Array.isArray(index)) {
                        setSelectedCommunity(communities[index.row].value)
                    }
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
