import { Button } from "@mantine/core"

type ShellThemeToggleProps = {
	onToggle: () => void
}

export function ShellThemeToggle({ onToggle }: ShellThemeToggleProps) {
	return (
		<Button
			type="button"
			variant="subtle"
			size="sm"
			onClick={onToggle}
			aria-label="Cambiar tema"
			title="Cambiar tema"
			leftSection={
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9" />
				</svg>
			}
		>
			Tema
		</Button>
	)
}
