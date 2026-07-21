import { AuthStatusCard } from "@components"
import { useLoadPermits, useReadPermits } from "@hooks"
import { useMobileAuthStore } from "@utils/auth-store"
import { ROUTES } from "@utils/constants"
import { useAppTheme } from "@utils/useAppTheme"
import { router } from "expo-router"
import { FlatList, View } from "react-native"
import { Button, Card, Icon, Text } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

export default function HomeScreen() {
	const theme = useAppTheme()
	const { token, user, isHydrated } = useMobileAuthStore()
	const { data: permits, loading } = useReadPermits()
	const {
		loadPermits,
		loadingPermits,
		error: permitError,
		clearError: clearPermitError,
	} = useLoadPermits()

	const isAuthenticated = Boolean(token && user)
	const hasPermits = permits.length > 0

	const onLoadPermits = async () => {
		if (!token) {
			return
		}

		if (permitError) {
			clearPermitError()
		}

		await loadPermits(token)
	}

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
					<View style={{ gap: 10 }}>
						{isHydrated && !isAuthenticated ? (
							<AuthStatusCard
								isAuthenticated={false}
								userEmail={null}
								onLogin={() => router.push(ROUTES.LOGIN)}
								onLogout={() =>
									useMobileAuthStore.getState().logout()
								}
								surfaceVariantColor={
									theme.colors.surfaceVariant
								}
							/>
						) : null}
						{isHydrated && isAuthenticated && !hasPermits ? (
							<Card>
								<Card.Content style={{ gap: 12 }}>
									<Text variant="titleMedium">
										Cargar permisos
									</Text>
									<Text variant="bodyMedium">
										Todavia no hay permisos en este
										dispositivo.
									</Text>
									{permitError ? (
										<Text
											style={{
												color: theme.colors.error,
											}}
										>
											{permitError}
										</Text>
									) : null}
									<Button
										mode="contained"
										onPress={onLoadPermits}
										loading={loadingPermits}
										disabled={loadingPermits}
									>
										{permitError
											? "Reintentar carga de permisos"
											: "Cargar permisos"}
									</Button>
								</Card.Content>
							</Card>
						) : null}
					</View>
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
							{loading || loadingPermits
								? "Cargando permisos"
								: "Sin permisos aún"}
						</Text>
					</View>
				}
				renderItem={({ item: permit }) => (
					<Card
						style={{ marginBottom: 10 }}
						onPress={() =>
							router.push(
								ROUTES.OVERVIEW({
									permitId: permit.id,
									permitNumber: permit.permitNumber,
								}),
							)
						}
					>
						<Card.Content>
							<Text variant="titleSmall">
								{permit.permitNumber}
							</Text>
							<Text variant="bodyMedium">
								{permit.userFullName}
							</Text>
						</Card.Content>
					</Card>
				)}
			/>
		</SafeAreaView>
	)
}
