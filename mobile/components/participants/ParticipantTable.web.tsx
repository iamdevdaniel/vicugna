import type { ParticipantData, ParticipantFormData } from "@definitions/types"
import { yupResolver } from "@hookform/resolvers/yup"
import { useSingleParticipantActions } from "@hooks"
import {
	Alert,
	Button,
	Group,
	ScrollArea,
	Select,
	Table,
	Text,
	TextInput,
} from "@mantine/core"
import {
	defaultValuesParticipant,
	yupParticipant,
} from "@utils/yup-participants"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"

const TEST_SIGNATURE = JSON.stringify(["M20 50 L80 20 L140 50"])

type ParticipantTableProps = {
	permitId: string
	participants: ParticipantData[]
	readOnly: boolean
}

export function ParticipantTable({
	permitId,
	participants,
	readOnly,
}: ParticipantTableProps) {
	const [editingId, setEditingId] = useState<string | null>(null)
	const {
		createSingleParticipant,
		updateSingleParticipant,
		deleteSingleParticipant,
		saving,
		deleting,
		error,
		clearError,
	} = useSingleParticipantActions()
	const {
		control,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors },
	} = useForm<ParticipantFormData>({
		defaultValues: defaultValuesParticipant,
		resolver: yupResolver(yupParticipant),
	})
	const signature = watch("signature")

	const beginCreate = () => {
		clearError()
		reset(defaultValuesParticipant)
		setEditingId("new")
	}

	const beginEdit = (participant: ParticipantData) => {
		clearError()
		reset({
			name: participant.name,
			lastNames: participant.lastNames,
			gender: participant.gender,
			identityNumber: participant.identityNumber,
			signature: participant.signature,
			notes: participant.notes,
		})
		setEditingId(participant.id)
	}

	const cancelEdit = () => {
		clearError()
		reset(defaultValuesParticipant)
		setEditingId(null)
	}

	const save = handleSubmit(async (data) => {
		const saved =
			editingId === "new"
				? await createSingleParticipant(permitId, data)
				: editingId
					? await updateSingleParticipant(editingId, data)
					: false

		if (saved) cancelEdit()
	})

	const remove = async (participant: ParticipantData) => {
		if (!window.confirm(`¿Borrar a ${participant.name}?`)) return
		await deleteSingleParticipant(participant.id)
	}

	return (
		<>
			<Group justify="space-between" mb="md">
				<Text c="dimmed">
					{participants.length} participante
					{participants.length === 1 ? "" : "s"}
				</Text>
				<Button
					onClick={beginCreate}
					disabled={readOnly || editingId !== null}
				>
					Añadir participante
				</Button>
			</Group>

			{readOnly ? (
				<Alert color="blue" mb="md">
					Este permiso está sincronizado y es de solo lectura.
				</Alert>
			) : null}
			{error ? (
				<Alert color="red" mb="md" withCloseButton onClose={clearError}>
					{error.message}
				</Alert>
			) : null}

			<ScrollArea>
				<Table striped highlightOnHover miw={1180} verticalSpacing="sm">
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Nombre</Table.Th>
							<Table.Th>Apellidos</Table.Th>
							<Table.Th>Género</Table.Th>
							<Table.Th>Cédula</Table.Th>
							<Table.Th>Firma</Table.Th>
							<Table.Th>Notas</Table.Th>
							<Table.Th style={stickyActionStyle}>
								Acciones
							</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{participants.map((participant) =>
							editingId === participant.id ? (
								<EditorRow
									key={participant.id}
									control={control}
									errors={errors}
									signature={signature}
									setSignature={(value) =>
										setValue("signature", value, {
											shouldDirty: true,
											shouldValidate: true,
										})
									}
									onSave={save}
									onCancel={cancelEdit}
									busy={saving}
								/>
							) : (
								<Table.Tr key={participant.id}>
									<Table.Td>{participant.name}</Table.Td>
									<Table.Td>{participant.lastNames}</Table.Td>
									<Table.Td>
										{participant.gender === "F"
											? "Femenino"
											: "Masculino"}
									</Table.Td>
									<Table.Td>
										{participant.identityNumber}
									</Table.Td>
									<Table.Td>Registrada</Table.Td>
									<Table.Td>
										{participant.notes || "—"}
									</Table.Td>
									<Table.Td style={stickyActionStyle}>
										<Group gap="xs" wrap="nowrap">
											<Button
												variant="light"
												onClick={() =>
													beginEdit(participant)
												}
												disabled={
													readOnly ||
													editingId !== null
												}
											>
												Editar
											</Button>
											<Button
												color="red"
												variant="subtle"
												onClick={() =>
													void remove(participant)
												}
												disabled={
													readOnly ||
													editingId !== null ||
													deleting
												}
											>
												Borrar
											</Button>
										</Group>
									</Table.Td>
								</Table.Tr>
							),
						)}
						{editingId === "new" ? (
							<EditorRow
								control={control}
								errors={errors}
								signature={signature}
								setSignature={(value) =>
									setValue("signature", value, {
										shouldDirty: true,
										shouldValidate: true,
									})
								}
								onSave={save}
								onCancel={cancelEdit}
								busy={saving}
							/>
						) : null}
						{participants.length === 0 && editingId !== "new" ? (
							<Table.Tr>
								<Table.Td colSpan={7}>
									<Text ta="center" c="dimmed" py="xl">
										Todavía no hay participantes.
									</Text>
								</Table.Td>
							</Table.Tr>
						) : null}
					</Table.Tbody>
				</Table>
			</ScrollArea>
			<Text size="xs" c="dimmed" mt="md">
				La firma de prueba es temporal para validar la persistencia. El
				control de dibujo se implementará en la fase de interfaz.
			</Text>
		</>
	)
}

type EditorRowProps = {
	control: ReturnType<typeof useForm<ParticipantFormData>>["control"]
	errors: ReturnType<
		typeof useForm<ParticipantFormData>
	>["formState"]["errors"]
	signature: string
	setSignature: (value: string) => void
	onSave: () => void
	onCancel: () => void
	busy: boolean
}

function EditorRow({
	control,
	errors,
	signature,
	setSignature,
	onSave,
	onCancel,
	busy,
}: EditorRowProps) {
	return (
		<Table.Tr>
			<Table.Td>
				<Controller
					name="name"
					control={control}
					render={({ field }) => (
						<TextInput {...field} error={errors.name?.message} />
					)}
				/>
			</Table.Td>
			<Table.Td>
				<Controller
					name="lastNames"
					control={control}
					render={({ field }) => (
						<TextInput
							{...field}
							error={errors.lastNames?.message}
						/>
					)}
				/>
			</Table.Td>
			<Table.Td>
				<Controller
					name="gender"
					control={control}
					render={({ field }) => (
						<Select
							value={field.value}
							onChange={(value) => field.onChange(value)}
							data={[
								{ value: "F", label: "Femenino" },
								{ value: "M", label: "Masculino" },
							]}
							error={errors.gender?.message}
						/>
					)}
				/>
			</Table.Td>
			<Table.Td>
				<Controller
					name="identityNumber"
					control={control}
					render={({ field }) => (
						<TextInput
							{...field}
							error={errors.identityNumber?.message}
						/>
					)}
				/>
			</Table.Td>
			<Table.Td>
				<Button
					variant={signature ? "light" : "outline"}
					onClick={() =>
						setSignature(signature ? "" : TEST_SIGNATURE)
					}
					color={errors.signature ? "red" : undefined}
				>
					{signature ? "Firma registrada" : "Agregar firma"}
				</Button>
				{errors.signature ? (
					<Text c="red" size="xs">
						{errors.signature.message}
					</Text>
				) : null}
			</Table.Td>
			<Table.Td>
				<Controller
					name="notes"
					control={control}
					render={({ field }) => <TextInput {...field} />}
				/>
			</Table.Td>
			<Table.Td style={stickyActionStyle}>
				<Group gap="xs" wrap="nowrap">
					<Button onClick={onSave} loading={busy}>
						Guardar
					</Button>
					<Button
						variant="default"
						onClick={onCancel}
						disabled={busy}
					>
						Cancelar
					</Button>
				</Group>
			</Table.Td>
		</Table.Tr>
	)
}

const stickyActionStyle = {
	position: "sticky" as const,
	right: 0,
	background: "var(--mantine-color-body)",
	zIndex: 1,
}
