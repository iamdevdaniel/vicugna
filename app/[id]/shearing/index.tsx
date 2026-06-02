import { StepList, VicugnaIcon } from "@components"
import { useReadShearingHeader, useReadShearingRecords } from "@database"
import { ROUTES } from "@utils/constants"
import { useAppTheme } from "@utils/useAppTheme"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { ScrollView, Text, View } from "react-native"
import { Button } from "react-native-paper"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

export default function () {
	const theme = useAppTheme()
	const insets = useSafeAreaInsets()
	const { id } = useLocalSearchParams<{ id: string }>()
	const { data: shearingForm } = useReadShearingHeader(id)
	const { data: shearingRecords } = useReadShearingRecords(id)

	const shearingStepState = shearingForm?.isCompleted ? "done" : "ready"
	const shearingRecordsStepState = shearingRecords.length ? "done" : "ready"

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: theme.colors.background }}
		>
			<VicugnaIcon />
			<Stack.Screen options={{ title: `Permiso ${id || ""}` }} />
			<ScrollView
				contentContainerStyle={{
					paddingHorizontal: 20,
					backgroundColor: "transparent",
				}}
				style={{ flex: 1 }}
			>
				<StepList
					steps={[
						{
							title: "Datos de esquila",
							state: shearingStepState,
							onAction: () =>
								router.push(ROUTES.SHEARING.HEADER(id)),
						},
						{
							title: "Registros de esquila",
							state: shearingRecordsStepState,
							onAction: () =>
								router.push(ROUTES.SHEARING.RECORD(id)),
							details: (
								<Text>Total: {shearingRecords.length}</Text>
							),
						},
					]}
				/>
			</ScrollView>
			<View
				style={{
					position: "absolute",
					left: 0,
					right: 0,
					bottom: 0,
					padding: 16,
					paddingBottom: 16 + insets.bottom,
					backgroundColor: theme.colors.background,
				}}
			>
				<Button
					mode="contained"
					icon="plus"
					contentStyle={{ height: 48 }}
					onPress={() => router.push(ROUTES.SHEARING.RECORD(id))}
				>
					Añadir registro
				</Button>
			</View>
		</SafeAreaView>
	)
}
