import type { MonitoringPageData } from "./monitoring.types"

export async function getMonitoringPageState(): Promise<
	Omit<MonitoringPageData, "pageTitle" | "adminUser">
> {
	return {}
}
