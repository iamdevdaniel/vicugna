import { Button, Container, Paper, Stack, Text, Title } from "@mantine/core"
import { Link } from "expo-router"
import { AppShell } from "./AppShell.web"

type RoutePlaceholderProps = {
	title: string
	description: string
}

export function RoutePlaceholder({
	title,
	description,
}: RoutePlaceholderProps) {
	return (
		<AppShell>
			<Container size="xl">
				<Paper withBorder p="xl">
					<Stack align="flex-start">
						<Title order={1}>{title}</Title>
						<Text c="dimmed">{description}</Text>
						<Button component={Link} href="/" variant="light">
							Volver a permisos
						</Button>
					</Stack>
				</Paper>
			</Container>
		</AppShell>
	)
}
