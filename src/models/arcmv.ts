import ARCMVListData from '../common/arcmv.json'

export type ARCMVListType = {
    [department: string]: {
        [regional: string]: {
            id: number
            community: string
            municipality: string
            province: string
        }[]
    }
}

type option = { key: string; value: string }

const ARCMVList: ARCMVListType = ARCMVListData

export const getListOf = {
    departments: (): option[] =>
        Object.keys(ARCMVList).map((department, index) => ({
            key: index.toString(),
            value: department,
        })),
    regionals: (department: string): option[] => {
        if (ARCMVList[department]) {
            return Object.keys(ARCMVList[department]).map(
                (regional, index) => ({
                    key: index.toString(),
                    value: regional,
                }),
            )
        } else return []
    },
    communities: (regional: string, department: string): option[] =>
        Object.values(ARCMVList[department][regional]).map(community => ({
            key: community.id.toString(),
            value: community.community,
        })),
}
