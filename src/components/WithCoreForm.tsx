import React, { useState } from 'react'
import { View } from 'react-native'
import { WrappedFormProps } from 'src/models'

const WithCoreForm = (WrappedForm: React.FC<WrappedFormProps>) => {
    return () => {

        const [formData, setFormData] = useState<Record<string, unknown>>({})

        const handleInputChange = (name: string, value: string) => {
            setFormData((prevData: Record<string, unknown>) => ({
                ...prevData,
                [name]: value,
            }))
        }

        const handleSubmit = (formData: Record<string, unknown>) => {
            console.log(formData)
        }

        return (
            <View>
                <WrappedForm
                    formData={formData}
                    onInputChange={handleInputChange}
                    onSubmit={handleSubmit}
                />
            </View>
        )
    }
}


export default WithCoreForm