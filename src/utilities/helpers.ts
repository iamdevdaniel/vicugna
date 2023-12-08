export const isGreaterThanMin = (min: number) => (value: string | undefined) =>
    value ? parseFloat(value) >= min : false
export const isLessThanMax = (max: number) => (value: string | undefined) =>
    value ? parseFloat(value) <= max : false
