export interface WrappedFormProps {
    formData: Record<string, unknown>;
    onInputChange: (name: string, value: string) => void;
    onSubmit: (formData: Record<string, unknown>) => void;
}

