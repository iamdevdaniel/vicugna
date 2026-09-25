import { Card, Group, Text, ThemeIcon, Title } from "@mantine/core"
import type { ReactNode } from "react"
import { Link } from "react-router"

type HomeSectionCardProps = {
	title: string
	description: string
	href: string
	icon: ReactNode
}

export function HomeSectionCard({
	title,
	description,
	href,
	icon,
}: HomeSectionCardProps) {
	return (
		<Card
			component={Link}
			to={href}
			withBorder
			shadow="sm"
			padding="xl"
			mih={224}
			style={{ textDecoration: "none" }}
		>
			<ThemeIcon size={48} radius="md">
				{icon}
			</ThemeIcon>
			<Group justify="space-between" mt="xl" gap="md" wrap="nowrap">
				<Title order={2} size="h2">
					{title}
				</Title>
				<Text span size="xl" c="sage" aria-hidden="true">
					→
				</Text>
			</Group>
			<Text mt="xs" size="sm" c="dimmed" lh={1.6}>
				{description}
			</Text>
		</Card>
	)
}
