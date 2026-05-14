import { OverviewStep } from "@components"
import { useReadOneForm11 } from "@database"
import { ROUTES } from "@utils/constants"
import { getCommunityName, getRegionalName } from "@utils/name-lookup"
import { useAppTheme } from "@utils/useAppTheme"
import { type Route, router, Stack, useLocalSearchParams } from "expo-router"
import { ScrollView, View } from "react-native"

// ROUTE form11/[id]
export default function Form11Overview() {
	const theme = useAppTheme()
	const { id } = useLocalSearchParams()
	const { data: form } = useReadOneForm11(id as string)
	const shearingDone = form?.shearing.isCompleted ?? false
	const dehearingDone = form?.dehearing.isCompleted ?? false

	return (
		<View style={{ flex: 1, backgroundColor: theme.colors.background }}>
			<Stack.Screen options={{ title: `Formulario ${id || ""}` }} />
			<ScrollView
				contentContainerStyle={{
					padding: 20,
					backgroundColor: "transparent",
				}}
				style={{ flex: 1 }}
			>
				<OverviewStep
					number={1}
					title="Formulario Captura"
					state={shearingDone ? "done" : "ready"}
					onAction={() =>
						router.push(
							ROUTES.FORM11.SHEARING.replace(
								"[id]",
								id as string,
							) as Route,
						)
					}
					details={
						shearingDone && form?.shearing
							? [
									{
										label: "Departamento",
										value: form.shearing.departamento,
									},
									{
										label: "Regional",
										value: getRegionalName(form.shearing),
									},
									{
										label: "Comunidad",
										value: getCommunityName(form.shearing),
									},
									{
										label: "Sitio",
										value: form.shearing.sitioCaptura,
									},
									{
										label: "Fecha",
										value: form.shearing.fechaCaptura,
									},
									{
										label: "Autorización",
										value: form.shearing.codigoAutorizacion,
									},
								]
							: undefined
					}
				/>
				<OverviewStep
					number={2}
					title="Formulario Predescerdado"
					state={
						!shearingDone
							? "disabled"
							: dehearingDone
								? "done"
								: "ready"
					}
					onAction={() =>
						router.push(
							ROUTES.FORM11.DEHEARING.replace(
								"[id]",
								id as string,
							) as Route,
						)
					}
					details={
						dehearingDone && form?.dehearing
							? [
									{
										label: "Inicio",
										value: form.dehearing
											.fechaInicioPredescerdado,
									},
									{
										label: "Fin",
										value: form.dehearing
											.fechaFinPredescerdado,
									},
									{
										label: "Lugar",
										value: form.dehearing
											.lugarPredescerdado,
									},
									{
										label: "Responsable",
										value: form.dehearing
											.responsablesPredescerdado,
									},
								]
							: undefined
					}
				/>
				<OverviewStep
					number={3}
					title="Formulario Esquila"
					state={!dehearingDone ? "disabled" : "ready"}
					onAction={() =>
						router.push(
							ROUTES.FORM11.RECORDS.LIST.replace(
								"[id]",
								id as string,
							) as Route,
						)
					}
				/>
			</ScrollView>
		</View>
	)
}
