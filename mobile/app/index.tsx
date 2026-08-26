import {
	AccentCard,
	DevSeedFab,
	HomeUserHeader,
	PermitStatusIndicator,
} from "@components"
import { useLoadPermits, useReadPermits } from "@hooks"
import { useMobileAuthStore } from "@utils/auth-store"
import { ROUTES } from "@utils/constants"
import { getCommunityName } from "@utils/regionals"
import { useAppTheme } from "@utils/useAppTheme"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { Alert, FlatList, View } from "react-native"
import {
	ActivityIndicator,
	Button,
	Card,
	Icon,
	Snackbar,
	Text,
} from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import { useShallow } from "zustand/react/shallow"

export default function HomeScreen() {
	const theme = useAppTheme()
	const [isRefreshCoolingDown, setIsRefreshCoolingDown] = useState(false)
	const [feedback, setFeedback] = useState<{
		message: string
		type: "success" | "error"
	} | null>(null)
	const { user, isAuthenticated, logout } = useMobileAuthStore(
		useShallow((state) => ({
			user: state.user,
			isAuthenticated: state.isAuthenticated,
			logout: state.logout,
		})),
	)
	const { data: permits, loading } = useReadPermits()
	const { loadPermits, loadingPermits } = useLoadPermits()

	const hasPermits = permits.length > 0
	const isPermitListLoading = loading || loadingPermits
	const shouldShowPermitLoadCard =
		isAuthenticated && !hasPermits && !loadingPermits
	const onManualRefresh = async () => {
		if (loadingPermits || isRefreshCoolingDown) return

		const result = await loadPermits()

		if (!result.ok) {
			setFeedback({ message: result.error, type: "error" })
			return
		}

		setFeedback({
			message: "Permisos actualizados",
			type: "success",
		})
		setIsRefreshCoolingDown(true)
	}

	const onGoToLogin = () => {
		router.replace(ROUTES.LOGIN)
	}

	useEffect(() => {
		if (!isAuthenticated) return

		const loadInitialPermits = async () => {
			const result = await loadPermits()

			if (!result.ok) {
				setFeedback({ message: result.error, type: "error" })
			}
		}

		void loadInitialPermits()
	}, [isAuthenticated, loadPermits])

	useEffect(() => {
		if (!isRefreshCoolingDown) return

		const cooldown = setTimeout(() => {
			setIsRefreshCoolingDown(false)
		}, 10_000)

		return () => clearTimeout(cooldown)
	}, [isRefreshCoolingDown])

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
							onLogout={logout}
						/>
						{isAuthenticated && hasPermits ? (
							<Button
								mode="outlined"
								icon="refresh"
								contentStyle={{ height: 48 }}
								onPress={onManualRefresh}
								loading={loadingPermits}
								disabled={
									loadingPermits || isRefreshCoolingDown
								}
							>
								{isRefreshCoolingDown
									? "Permisos actualizados"
									: "Actualizar permisos"}
							</Button>
						) : null}
						{shouldShowPermitLoadCard && (
							<Card>
								<Card.Content style={{ gap: 12 }}>
									<Text variant="titleMedium">
										Cargar permisos
									</Text>
									<Button
										mode="contained"
										onPress={onManualRefresh}
										loading={loadingPermits}
										disabled={
											loadingPermits ||
											isRefreshCoolingDown
										}
									>
										Cargar permisos
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
						{isPermitListLoading ? (
							<ActivityIndicator animating size="large" />
						) : (
							<Icon
								source="file-document-outline"
								size={40}
								color={theme.colors.outline}
							/>
						)}
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
							permit.syncStatus === "synced"
								? theme.colors.custom.green
								: theme.colors.surfaceVariant
						}
						prefix={
							<Icon
								source="file-key-outline"
								size={20}
								color={
									permit.syncStatus === "synced"
										? theme.colors.custom.white
										: theme.colors.onSurfaceVariant
								}
							/>
						}
						style={{ marginBottom: 10 }}
						onLongPress={() =>
							Alert.alert(
								"Información del permiso",
								`${permit.permitNumber}\n\n${getCommunityName(permit.communityId)}`,
							)
						}
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
								paddingVertical: 10,
								paddingHorizontal: 12,
							}}
						>
							<View
								style={{
									width: "40%",
									gap: 2,
								}}
							>
								<Text
									variant="titleMedium"
									numberOfLines={1}
									ellipsizeMode="tail"
								>
									{permit.permitNumber}
								</Text>
								<Text
									variant="bodyMedium"
									numberOfLines={1}
									ellipsizeMode="tail"
								>
									{getCommunityName(permit.communityId)}
								</Text>
							</View>
							<PermitStatusIndicator
								participantsStatus={permit.participantsStatus}
								shearingStatus={permit.shearingStatus}
								cleaningStatus={permit.cleaningStatus}
							/>
							<View
								style={{
									width: "15%",
									height: 26,
									alignItems: "flex-end",
									justifyContent: "center",
								}}
							>
								{permit.syncStatus === "synced" ? (
									<Icon
										source="cloud-check-outline"
										size={26}
										color={theme.colors.custom.green}
									/>
								) : permit.syncStatus === "reopened" ? (
									<Icon
										source="lock-open-variant-outline"
										size={26}
										color={theme.colors.primary}
									/>
								) : null}
							</View>
						</View>
					</AccentCard>
				)}
			/>
			<DevSeedFab permits={permits} />
			<Snackbar
				visible={feedback !== null}
				onDismiss={() => setFeedback(null)}
				duration={3500}
				style={{
					backgroundColor:
						feedback?.type === "error"
							? theme.colors.error
							: theme.colors.inverseSurface,
				}}
				action={{
					label: "Cerrar",
					textColor:
						feedback?.type === "error"
							? theme.colors.onError
							: theme.colors.inverseOnSurface,
					onPress: () => setFeedback(null),
				}}
			>
				<Text
					style={{
						color:
							feedback?.type === "error"
								? theme.colors.onError
								: theme.colors.inverseOnSurface,
					}}
				>
					{feedback?.message}
				</Text>
			</Snackbar>
		</SafeAreaView>
	)
}
