import { useNavigation as regularUseNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import RootStackParamList from '../common/navigationTypes'

function useNavigation<
    RouteName extends keyof RootStackParamList = keyof RootStackParamList,
>() {
    return regularUseNavigation<
        NativeStackNavigationProp<RootStackParamList, RouteName>
    >()
}

export default useNavigation
