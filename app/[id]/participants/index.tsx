import { useReadParticipants } from "@database"
import { ROUTES } from "@utils/constants"
import { useAppTheme } from "@utils/useAppTheme"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { FlatList } from "react-native"
import { Divider, FAB, List } from "react-native-paper"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

// PARTICIPANTS.OVERVIEW /[id]/participants
export default function ParticipantsListScreen() {
	const theme = useAppTheme()
	const insets = useSafeAreaInsets()
	const { id } = useLocalSearchParams<{ id: string }>()
	const { data: participants } = useReadParticipants(id)

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: theme.colors.background }}
			edges={[]}
		>
			<Stack.Screen options={{ title: "Participantes" }} />
			<FlatList
				data={participants}
				keyExtractor={(item) => item.id}
				ItemSeparatorComponent={() => <Divider />}
				renderItem={({ item }) => (
					<List.Item
						title={`${item.nombre} ${item.apellidos}`}
						description={item.cedulaIdentidad}
						onPress={() =>
							router.push(ROUTES.PARTICIPANTS.FORM(id, item.id))
						}
					/>
				)}
			/>
			<FAB
				icon="plus"
				style={{
					position: "absolute",
					bottom: 24 + insets.bottom,
					right: 24,
				}}
				onPress={() => router.push(ROUTES.PARTICIPANTS.FORM(id, "new"))}
			/>
		</SafeAreaView>
	)
}
