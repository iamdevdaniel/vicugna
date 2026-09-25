import { Container, Grid, Text, Title } from "@mantine/core"
import { HomeSectionCard } from "./home-section-card"

export function HomeView() {
	return (
		<Container component="main" size="lg" py="xl">
			<header>
				<Text size="xs" fw={700} c="dimmed" tt="uppercase">
					Panel administrativo
				</Text>
				<Title order={1} mt={4}>
					Inicio
				</Title>
				<Text mt="xs" maw={672} size="sm" c="dimmed">
					Gestiona el acceso, las asignaciones y el seguimiento de los
					permisos.
				</Text>
			</header>
			<Grid component="section" mt="xl">
				<Grid.Col span={{ base: 12, md: 6 }}>
					<HomeSectionCard
						title="Usuarios"
						description="Crear encargados y revisar las personas con acceso al sistema."
						href="/users"
						icon={<UsersIcon />}
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6 }}>
					<HomeSectionCard
						title="Asignaciones"
						description="Asignar comunidad, encargado y permisos para la temporada."
						href="/assignments"
						icon={<AssignmentsIcon />}
					/>
				</Grid.Col>
				<Grid.Col span={12}>
					<HomeSectionCard
						title="Seguimiento"
						description="Revisar sincronización, avance y exportar los datos finales."
						href="/monitoring"
						icon={<MonitoringIcon />}
					/>
				</Grid.Col>
			</Grid>
		</Container>
	)
}

function UsersIcon() {
	return (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
			<path d="M16 3.128a4 4 0 0 1 0 7.744M22 21v-2a4 4 0 0 0-3-3.87" />
			<circle cx="9" cy="7" r="4" />
		</svg>
	)
}

function AssignmentsIcon() {
	return (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<rect width="8" height="4" x="8" y="2" rx="1" />
			<path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-.5M16 4h2a2 2 0 0 1 1.73 1M8 18h1" />
			<path d="M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
		</svg>
	)
}

function MonitoringIcon() {
	return (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M10 10h4M19 7V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3M22 16H2M9 7V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v3" />
			<path d="M20 21a2 2 0 0 0 2-2v-3.851c0-1.39-2-2.962-2-4.829V8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2zM4 21a2 2 0 0 1-2-2v-3.851c0-1.39 2-2.962 2-4.829V8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2z" />
		</svg>
	)
}
