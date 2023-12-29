import ARCMVListData from '../common/arcmv.json'

export type option = {
    key: string
    value: string
}

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

const ARCMVList: ARCMVListType = ARCMVListData

export const getOptionListOf = {
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
    regionalsByDepartment: (): { [department: string]: option[] } =>
        Object.keys(ARCMVList).reduce<{ [department: string]: option[] }>(
            (allRegionals, department) => {
                allRegionals[department] = getOptionListOf.regionals(department)
                return allRegionals
            },
            {},
        ),
    communitiesByDepartmentAndRegional: (): {
        [department: string]: {
            [regional: string]: { key: string; value: string }[]
        }
    } =>
        Object.keys(ARCMVList).reduce<{
            [department: string]: {
                [regional: string]: { key: string; value: string }[]
            }
        }>((allCommunities, department) => {
            allCommunities[department] = Object.keys(
                ARCMVList[department],
            ).reduce<{ [regional: string]: { key: string; value: string }[] }>(
                (regionals, regional) => {
                    regionals[regional] = ARCMVList[department][regional].map(
                        community => ({
                            key: community.id.toString(),
                            value: community.community,
                        }),
                    )
                    return regionals
                },
                {},
            )
            return allCommunities
        }, {}),
}
