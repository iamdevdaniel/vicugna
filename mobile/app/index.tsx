import { AuthStatusCard } from "@components"
import { useReadPermits } from "@hooks"
import { useMobileAuthStore } from "@utils/auth-store"
import { ROUTES } from "@utils/constants"
import { useAppTheme } from "@utils/useAppTheme"
import { router } from "expo-router"
import { FlatList, View } from "react-native"
import { Card, Icon, Text } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

export default function HomeScreen() {
	const theme = useAppTheme()
	const { token, user, isHydrated } = useMobileAuthStore()
	const { data: permits, loading } = useReadPermits()

	const isAuthenticated = Boolean(token && user)

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: theme.colors.background }}
		>
			<FlatList
				data={permits}
				keyExtractor={(item) => item.id}
				contentContainerStyle={{
					padding: 16,
					paddingBottom: 32,
					gap: 10,
					flexGrow: 1,
				}}
				ListHeaderComponent={
					isHydrated && !isAuthenticated ? (
						<AuthStatusCard
							isAuthenticated={false}
							userEmail={null}
							onLogin={() => router.push(ROUTES.LOGIN)}
							onLogout={() =>
								useMobileAuthStore.getState().logout()
							}
							surfaceVariantColor={theme.colors.surfaceVariant}
						/>
					) : null
				}
				ListEmptyComponent={
					<View
						style={{
							flex: 1,
							alignItems: "center",
							justifyContent: "center",
							paddingBottom: 64,
							gap: 12,
						}}
					>
						<Icon
							source="file-document-outline"
							size={40}
							color={theme.colors.outline}
						/>
						<Text variant="bodyLarge">
							{loading ? "Cargando permisos" : "Sin permisos aún"}
						</Text>
					</View>
				}
				renderItem={({ item }) => (
					<Card
						style={{ marginBottom: 10 }}
						onPress={() => router.push(ROUTES.OVERVIEW(item.id))}
					>
						<Card.Content>
							<Text variant="titleSmall">
								{item.permitNumber}
							</Text>
							<Text variant="bodyMedium">
								{item.userFullName}
							</Text>
							<Text variant="bodySmall">{item.date || "-"}</Text>
						</Card.Content>
					</Card>
				)}
			/>
		</SafeAreaView>
	)
}
