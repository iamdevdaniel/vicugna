import { AccentCard, DevSeedFab, HomeUserHeader } from "@components"
import { useLoadPermits, useReadPermits } from "@hooks"
import { useMobileAuthStore } from "@utils/auth-store"
import { ROUTES } from "@utils/constants"
import { getCommunityName } from "@utils/regionals"
import { useAppTheme } from "@utils/useAppTheme"
import { router } from "expo-router"
import { FlatList, View } from "react-native"
import { Button, Card, Icon, Text } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import { useShallow } from "zustand/react/shallow"

export default function HomeScreen() {
	const theme = useAppTheme()
	const { user, isAuthenticated } = useMobileAuthStore(
		useShallow((state) => ({
			user: state.user,
			isAuthenticated: state.isAuthenticated,
		})),
	)
	const { data: permits, loading } = useReadPermits()
	const {
		loadPermits,
		loadingPermits,
		error: permitError,
		clearError: clearPermitError,
	} = useLoadPermits()

	const hasPermits = permits.length > 0
	const isPermitListLoading = loading || loadingPermits
	const shouldShowPermitLoadCard = isAuthenticated && !hasPermits
	const permitLoadButtonLabel = permitError
		? "Reintentar carga de permisos"
		: "Cargar permisos"

	const onLoadPermits = async () => {
		if (permitError) {
			clearPermitError()
		}

		await loadPermits()
	}

	const onGoToLogin = () => {
		router.push(ROUTES.LOGIN)
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
						<HomeUserHeader
							user={isAuthenticated ? user : null}
							onLogin={onGoToLogin}
						/>
						{shouldShowPermitLoadCard && (
							<Card>
								<Card.Content style={{ gap: 12 }}>
									<Text variant="titleMedium">
										Cargar permisos
									</Text>
									{permitError && (
										<Text
											style={{
												color: theme.colors.error,
											}}
										>
											{permitError}
										</Text>
									)}
									<Button
										mode="contained"
										onPress={onLoadPermits}
										loading={loadingPermits}
										disabled={loadingPermits}
									>
										{permitLoadButtonLabel}
									</Button>
								</Card.Content>
							</Card>
						)}
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
							{isPermitListLoading
								? "Cargando permisos..."
								: "No hay permisos disponibles."}
						</Text>
					</View>
				}
				renderItem={({ item: permit }) => (
					<AccentCard
						accent={
							permit.isSynced
								? theme.colors.custom.green
								: theme.colors.surfaceVariant
						}
						prefix={
							<Icon
								source="file-key-outline"
								size={20}
								color={
									permit.isSynced
										? theme.colors.custom.white
										: theme.colors.onSurfaceVariant
								}
							/>
						}
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
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								gap: 12,
								paddingVertical: 12,
								paddingRight: 12,
							}}
						>
							<View style={{ flex: 1, gap: 2 }}>
								<Text variant="titleMedium">
									{permit.permitNumber}
								</Text>
								<Text variant="bodyMedium">
									{getCommunityName(permit.communityId)}
								</Text>
							</View>
							<View
								style={{
									flexDirection: "row",
									alignItems: "center",
								}}
							>
								{permit.isSynced ? (
									<Icon
										source="cloud-check-outline"
										size={26}
										color={theme.colors.custom.green}
									/>
								) : null}
							</View>
						</View>
					</AccentCard>
				)}
			/>
			<DevSeedFab permits={permits} />
		</SafeAreaView>
	)
}
