import { useAppTheme } from "@utils/useAppTheme"
import { Chip } from "react-native-paper"

export function TotalChip({ total }: { total: number }) {
	const theme = useAppTheme()

	return (
		<Chip
			compact
			style={{
				backgroundColor: theme.colors.surfaceVariant,
				alignSelf: "flex-start",
			}}
		>
			Total {total}
		</Chip>
	)
}
