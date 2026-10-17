import type { PermitData, PermitFieldData } from "@shared"

export type MobilePermitData = {
	permit: PermitData
	serverHash: string
	hashVersion: number
	fieldData: PermitFieldData | null
}
