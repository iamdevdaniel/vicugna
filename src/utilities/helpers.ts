import { useState, useEffect } from 'react'

export const isGreaterThanMin = (min: number) => (value: string | undefined) =>
    value ? parseFloat(value) >= min : false

export const isLessThanMax = (max: number) => (value: string | undefined) =>
    value ? parseFloat(value) <= max : false

export const useFetch = (url: string) => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetch(url)
            .then(response => {
                if (response.ok) {
                    return response.json()
                } else {
                    throw response
                }
            })
            .then(data => setData(data))
            .catch(error => setError(error))
            .finally(() => setLoading(false))
    }, [url])

    return [data, loading, error]
}
