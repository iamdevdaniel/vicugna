import {
	Alert,
	Button,
	Group,
	Modal,
	Stack,
	Text,
	TextInput,
} from "@mantine/core"
import type { RefObject } from "react"
import type { UsersState } from "./users-state"

type UsersCreateModalProps = Pick<
	UsersState,
	| "createUser"
	| "passwordSuggestion"
	| "password"
	| "formRef"
	| "firstFieldRef"
	| "isSubmitting"
	| "closeModal"
	| "setPassword"
	| "requestPasswordSuggestion"
>

export function UsersCreateModal(props: UsersCreateModalProps) {
	const {
		createUser,
		passwordSuggestion,
		password,
		formRef,
		firstFieldRef,
		isSubmitting,
		closeModal,
		setPassword,
		requestPasswordSuggestion,
	} = props

	return (
		<Modal
			opened
			onClose={closeModal}
			closeOnClickOutside={!isSubmitting}
			closeOnEscape={!isSubmitting}
			withCloseButton={false}
			centered
			title="Nuevo usuario"
		>
			<createUser.Form
				ref={formRef}
				method="post"
				autoComplete="off"
				style={{ marginTop: 20 }}
			>
				<Stack gap="md">
					{createUser.data?.ok === false ? (
						<Alert color="red" role="alert">
							{createUser.data.errorMessage}
						</Alert>
					) : null}
					<FormField
						label="Nombres"
						name="firstName"
						inputRef={firstFieldRef}
					/>
					<FormField
						label="Apellido paterno"
						name="paternalLastName"
					/>
					<FormField
						label="Apellido materno"
						name="maternalLastName"
					/>
					<FormField label="Teléfono" name="phoneNumber" type="tel" />
					<FormField
						label="Correo"
						name="email"
						type="email"
						optional
					/>
					<Group align="flex-end" wrap="nowrap">
						<TextInput
							label="Contraseña temporal"
							style={{ flex: 1 }}
							autoComplete="off"
							type="text"
							name="password"
							value={password}
							onChange={(event) =>
								setPassword(event.target.value)
							}
							required
						/>
						<Button
							type="button"
							variant="outline"
							onClick={requestPasswordSuggestion}
							disabled={
								passwordSuggestion.state !== "idle" ||
								isSubmitting
							}
						>
							{passwordSuggestion.state === "idle"
								? "Sugerir"
								: "Generando..."}
						</Button>
					</Group>
					<Group justify="flex-end" gap="md" mt="xs">
						<Button
							type="button"
							variant="subtle"
							onClick={closeModal}
							disabled={isSubmitting}
						>
							Cancelar
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Guardando..." : "Crear usuario"}
						</Button>
					</Group>
				</Stack>
			</createUser.Form>
		</Modal>
	)
}

type FormFieldProps = {
	label: string
	name: string
	type?: "text" | "tel" | "email"
	optional?: boolean
	inputRef?: RefObject<HTMLInputElement | null>
}

function FormField({
	label,
	name,
	type = "text",
	optional = false,
	inputRef,
}: FormFieldProps) {
	return (
		<TextInput
			ref={inputRef}
			label={
				<Group justify="space-between" gap="md">
					<Text span fw={500}>
						{label}
					</Text>
					{optional ? (
						<Text span size="xs" c="dimmed">
							Opcional
						</Text>
					) : null}
				</Group>
			}
			autoComplete="off"
			type={type}
			name={name}
			required={!optional}
		/>
	)
}
