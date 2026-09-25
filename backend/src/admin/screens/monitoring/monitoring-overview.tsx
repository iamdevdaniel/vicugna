import {
	Badge,
	Button,
	Group,
	Paper,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
	UnstyledButton,
} from "@mantine/core"
import { Link } from "react-router"
import { SYNCED_PERMIT_STATUSES } from "../../../modules/common/common.constants"
import type {
	MonitoringCommunityGroup,
	MonitoringPermitGroup,
} from "../../../modules/monitoring/monitoring.types"
import { useMonitoringState } from "./monitoring-state"

type MonitoringOverviewProps = {
	seasonId: string
	communityGroups: MonitoringCommunityGroup[]
}

export function MonitoringOverview({
	seasonId,
	communityGroups,
}: MonitoringOverviewProps) {
	const state = useMonitoringState(seasonId, communityGroups)

	return (
		<Paper component="section" p="md" withBorder shadow="sm">
			<Group
				align="flex-end"
				justify="space-between"
				gap="md"
				wrap="wrap"
			>
				<Group
					align="flex-end"
					gap="xs"
					wrap="nowrap"
					w="100%"
					maw={576}
				>
					<TextInput
						label="Buscar"
						style={{ flex: 1 }}
						size="sm"
						type="search"
						value={state.search}
						onChange={(event) =>
							state.setSearch(event.target.value)
						}
						placeholder="Comunidad, permiso o encargado"
					/>
					<Button
						type="button"
						variant={state.showSyncedOnly ? "filled" : "outline"}
						color={state.showSyncedOnly ? "green" : "sage"}
						size="sm"
						onClick={state.toggleSyncedOnly}
						aria-pressed={state.showSyncedOnly}
					>
						Sincronizados
					</Button>
				</Group>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={state.toggleAllCommunities}
				>
					{state.areAllCommunitiesExpanded
						? "Colapsar todo"
						: "Expandir todo"}
				</Button>
			</Group>

			<Stack mt="md" gap="sm">
				{state.filteredCommunityGroups.length === 0 ? (
					<Text px="sm" py={48} ta="center" size="sm" c="dimmed">
						No se encontraron permisos.
					</Text>
				) : null}
				{state.filteredCommunityGroups.map((community) => (
					<CommunitySection
						key={community.communityId}
						community={community}
						seasonId={seasonId}
						expanded={state.isExpanded(community.communityId)}
						onToggle={() =>
							state.toggleCommunity(community.communityId)
						}
						onOpenPermit={state.saveState}
					/>
				))}
			</Stack>
		</Paper>
	)
}

function CommunitySection({
	community,
	seasonId,
	expanded,
	onToggle,
	onOpenPermit,
}: {
	community: MonitoringCommunityGroup
	seasonId: string
	expanded: boolean
	onToggle: () => void
	onOpenPermit: () => void
}) {
	return (
		<Paper component="section" withBorder style={{ overflow: "hidden" }}>
			<UnstyledButton
				type="button"
				w="100%"
				p="sm"
				onClick={onToggle}
				aria-expanded={expanded}
			>
				<Group justify="space-between" gap="md" wrap="nowrap">
					<Text component="h2" truncate size="sm" fw={600}>
						{community.communityName}
					</Text>
					<Text span size="xs" c="dimmed">
						{community.permits.length} permisos{" "}
						{expanded ? "▾" : "›"}
					</Text>
				</Group>
			</UnstyledButton>
			{expanded ? (
				<SimpleGrid
					cols={{ base: 1, md: 2, xl: 4 }}
					spacing="xs"
					p="sm"
					style={{
						borderTop:
							"1px solid var(--mantine-color-default-border)",
					}}
				>
					{community.permits.map((permit) => (
						<PermitCard
							key={permit.permitId}
							permit={permit}
							seasonId={seasonId}
							onOpen={onOpenPermit}
						/>
					))}
				</SimpleGrid>
			) : null}
		</Paper>
	)
}

function PermitCard({
	permit,
	seasonId,
	onOpen,
}: {
	permit: MonitoringPermitGroup
	seasonId: string
	onOpen: () => void
}) {
	const synced = SYNCED_PERMIT_STATUSES.includes(permit.syncStatus)
	const search = new URLSearchParams({ seasonId, permitId: permit.permitId })

	return (
		<Paper
			component={Link}
			to={`/monitoring?${search.toString()}`}
			withBorder
			p="sm"
			style={{ textDecoration: "none" }}
			onClick={onOpen}
		>
			<Group
				align="flex-start"
				justify="space-between"
				gap="sm"
				wrap="nowrap"
			>
				<div style={{ minWidth: 0 }}>
					<Text truncate size="sm" fw={600}>
						Permiso {permit.permitNumber}
					</Text>
					<Group mt="xs" gap={6}>
						<CountBadge
							label="Participantes"
							value={permit.participantsCount}
							enabled={synced}
						/>
						<CountBadge
							label="Esquila"
							value={permit.shearingRecordsCount}
							enabled={synced}
						/>
						<CountBadge
							label="Fibra"
							value={permit.cleaningRecordsCount}
							enabled={synced}
						/>
					</Group>
				</div>
				<Text
					span
					c={
						permit.syncStatus === "reopened"
							? "yellow"
							: synced
								? "green"
								: "yellow"
					}
					title={getStatusLabel(permit.syncStatus)}
				>
					●
				</Text>
			</Group>
		</Paper>
	)
}

function CountBadge({
	label,
	value,
	enabled,
}: {
	label: string
	value: number | null
	enabled: boolean
}) {
	return (
		<Badge
			variant="outline"
			size="sm"
			color={enabled ? "sage" : "gray"}
			title={label}
		>
			{label}: {enabled ? value : "-"}
		</Badge>
	)
}

function getStatusLabel(status: string) {
	if (status === "reopened") return "Reabierto"
	if (status === "synced") return "Sincronizado"
	return "Pendiente"
}
