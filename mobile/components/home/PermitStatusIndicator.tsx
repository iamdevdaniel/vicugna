import { useAppTheme } from "@utils/useAppTheme"
import { View } from "react-native"
import { Text } from "react-native-paper"

function getStepStatusColor(
	status: "ready" | "done" | "disabled",
	colors: ReturnType<typeof useAppTheme>["colors"],
) {
	if (status === "done") {
		return colors.custom.green
	}

	if (status === "disabled") {
		return colors.custom.lightGray
	}

	return colors.custom.blue
}

export function PermitStatusIndicator({
	participantsStatus,
	shearingStatus,
	cleaningStatus,
}: {
	participantsStatus: "ready" | "done" | "disabled"
	shearingStatus: "ready" | "done" | "disabled"
	cleaningStatus: "ready" | "done" | "disabled"
}) {
	const theme = useAppTheme()
	const statuses = [
		{ id: "participants", label: "1", status: participantsStatus },
		{ id: "shearing", label: "2", status: shearingStatus },
		{ id: "cleaning", label: "3", status: cleaningStatus },
	]

	return (
		<View
			style={{
				flexDirection: "row",
				alignItems: "center",
				justifyContent: "center",
				width: "45%",
				paddingHorizontal: 4,
			}}
		>
			{statuses.map((item, index) => (
				<View
					key={item.id}
					style={{
						flexDirection: "row",
						alignItems: "center",
						flex: index < statuses.length - 1 ? 1 : 0,
					}}
				>
					<View
						style={{
							width: 22,
							height: 22,
							borderRadius: 11,
							backgroundColor: getStepStatusColor(
								item.status,
								theme.colors,
							),
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Text
							style={{
								color: theme.colors.custom.white,
								fontSize: 11,
								fontWeight: "700",
							}}
						>
							{item.label}
						</Text>
					</View>
					{index < statuses.length - 1 ? (
						<View
							style={{
								flex: 1,
								height: 2,
								marginHorizontal: 6,
								backgroundColor: theme.colors.outlineVariant,
							}}
						/>
					) : null}
				</View>
			))}
		</View>
	)
}
