import {
    useRoute as originalUseRoute,
    RouteProp,
} from '@react-navigation/native'

import RootStackParamList from '../common/navigationTypes'

function useRoute<RouteName extends keyof RootStackParamList>() {
    return originalUseRoute<RouteProp<RootStackParamList, RouteName>>()
}

export default useRoute
