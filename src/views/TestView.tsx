import React from 'react'
import { View } from 'react-native'
import TestComponent from '../components/TestComponent'

const TestView: React.FC = () => {
    return <View>
        <TestComponent name="BRMC | QOTSA" options={[
            { key: '1', value: 'Evil Has Landed' },
            { key: '2', value: 'Bad Blood' },
            { key: '3', value: 'If You Run' },
        ]} />
    </View>
}

export default TestView