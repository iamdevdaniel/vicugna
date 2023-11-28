import React, { useState } from 'react'
import { WrappedFormProps } from 'src/models'

const WithCoreForm = (WrappedForm: React.FC<WrappedFormProps>) => {
    const CoreForm = () => {
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
            <WrappedForm
                formData={formData}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
            />
        )
    }

    CoreForm.displayName = `WithCoreForm-${WrappedForm.displayName}`

    return CoreForm
}

export default WithCoreForm
