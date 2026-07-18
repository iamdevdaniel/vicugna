import { View } from "react-native"
import { Button, Card, Icon, Text } from "react-native-paper"

type AuthStatusCardProps = {
	isAuthenticated: boolean
	userEmail?: string | null
	onLogin: () => void
	onLogout: () => void
	surfaceVariantColor: string
}

export function AuthStatusCard({
	isAuthenticated,
	userEmail,
	onLogin,
	onLogout,
	surfaceVariantColor,
}: AuthStatusCardProps) {
	return (
		<Card
			style={{
				marginBottom: 16,
				backgroundColor: isAuthenticated
					? surfaceVariantColor
					: "#FDE68A",
			}}
		>
			<Card.Content
				style={{
					flexDirection: "row",
					alignItems: "center",
					gap: 8,
				}}
			>
				<Icon
					source={
						isAuthenticated ? "cloud-check-outline" : "lock-outline"
					}
					size={20}
				/>
				<View style={{ flex: 1 }}>
					<Text variant="labelLarge">
						{isAuthenticated
							? "Sesión iniciada"
							: "Sin iniciar sesión"}
					</Text>
					{isAuthenticated && userEmail ? (
						<Text variant="bodySmall">{userEmail}</Text>
					) : null}
				</View>
				<Button
					mode={isAuthenticated ? "outlined" : "contained"}
					onPress={isAuthenticated ? onLogout : onLogin}
				>
					{isAuthenticated ? "Cerrar sesión" : "Iniciar sesión"}
				</Button>
			</Card.Content>
		</Card>
	)
}
