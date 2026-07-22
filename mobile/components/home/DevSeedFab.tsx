import { clearPermitFieldData, seedPermitFieldData } from "@database"
import type { PermitData } from "@definitions/types"
import { useAppTheme } from "@utils/useAppTheme"
import { useState } from "react"
import { FlatList, Modal, Pressable, Text, View } from "react-native"
import { Button, FAB } from "react-native-paper"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export function DevSeedFab({ permits }: { permits: PermitData[] }) {
	const theme = useAppTheme()
	const insets = useSafeAreaInsets()
	const [isOpen, setIsOpen] = useState(false)
	const [busyPermitId, setBusyPermitId] = useState<string | null>(null)

	if (!__DEV__ || permits.length === 0) {
		return null
	}

	const onSeedPermit = async (permit: PermitData) => {
		try {
			setBusyPermitId(permit.id)
			await seedPermitFieldData(permit.id)
			setIsOpen(false)
		} finally {
			setBusyPermitId(null)
		}
	}

	const onClearPermit = async (permit: PermitData) => {
		try {
			setBusyPermitId(permit.id)
			await clearPermitFieldData(permit.id)
			setIsOpen(false)
		} finally {
			setBusyPermitId(null)
		}
	}

	return (
		<>
			<Modal
				visible={isOpen}
				transparent
				animationType="fade"
				onRequestClose={() => setIsOpen(false)}
			>
				<Pressable
					onPress={() => setIsOpen(false)}
					style={{
						flex: 1,
						backgroundColor: "rgba(0,0,0,0.35)",
						justifyContent: "center",
						padding: 20,
					}}
				>
					<Pressable
						onPress={() => {}}
						style={{
							maxHeight: 420,
							borderRadius: 16,
							backgroundColor: theme.colors.background,
							padding: 16,
							gap: 12,
						}}
					>
						<Text
							style={{
								fontSize: 18,
								fontWeight: "700",
								color: theme.colors.onSurface,
							}}
						>
							Seed de permisos
						</Text>
						<FlatList
							data={permits}
							keyExtractor={(item) => item.id}
							contentContainerStyle={{ gap: 8 }}
							renderItem={({ item }) => (
								<View
									style={{
										borderRadius: 12,
										backgroundColor:
											theme.colors.surfaceVariant,
										paddingHorizontal: 14,
										paddingVertical: 12,
										gap: 10,
										opacity:
											busyPermitId &&
											busyPermitId !== item.id
												? 0.6
												: 1,
									}}
								>
									<Text
										style={{
											fontWeight: "700",
											color: theme.colors.onSurface,
										}}
									>
										{item.permitNumber}
									</Text>
									<View
										style={{
											flexDirection: "row",
											gap: 8,
										}}
									>
										<Button
											mode="contained"
											compact
											onPress={() => onSeedPermit(item)}
											disabled={busyPermitId !== null}
											buttonColor={
												theme.colors.custom.blue
											}
											textColor={
												theme.colors.custom.white
											}
											style={{ flex: 1 }}
										>
											Seed
										</Button>
										<Button
											mode="outlined"
											compact
											onPress={() => onClearPermit(item)}
											disabled={busyPermitId !== null}
											textColor={
												theme.colors.custom.crimson
											}
											style={{ flex: 1 }}
										>
											Limpiar
										</Button>
									</View>
								</View>
							)}
						/>
					</Pressable>
				</Pressable>
			</Modal>
			<FAB
				icon="test-tube"
				label="DEV"
				onPress={() => setIsOpen(true)}
				style={{
					position: "absolute",
					right: 16,
					bottom: 16 + insets.bottom,
					backgroundColor: theme.colors.custom.crimson,
				}}
				color={theme.colors.custom.white}
			/>
		</>
	)
}
