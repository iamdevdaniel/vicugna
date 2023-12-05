export const deepEqual = (
    obj1: Record<string, unknown>,
    obj2: Record<string, unknown>,
) => {
    if (obj1 === obj2) {
        return true
    }

    if (
        typeof obj1 !== 'object' ||
        obj1 === null ||
        typeof obj2 !== 'object' ||
        obj2 === null
    ) {
        return false
    }

    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)

    if (keys1.length !== keys2.length) {
        return false
    }

    for (const key of keys1) {
        if (!keys2.includes(key)) {
            continue
        }

        const val1 = obj1[key]
        const val2 = obj2[key]

        if (
            (typeof val1 === 'object' &&
                val1 !== null &&
                typeof val2 === 'object' &&
                val2 !== null &&
                !deepEqual(
                    val1 as Record<string, unknown>,
                    val2 as Record<string, unknown>,
                )) ||
            val1 !== val2
        ) {
            return false
        }
    }

    return true
}
