import type { ShearingRecordFormData } from "@definitions/types"

type Sex = ShearingRecordFormData["sex"]
type AgeCategory = ShearingRecordFormData["ageCategory"]
type GestationStatus = ShearingRecordFormData["gestationStatus"]

export function canHaveGestation(sex: Sex, ageCategory: AgeCategory): boolean {
	return sex === "F" && ageCategory === "Adulto"
}

export function normalizeGestationStatus(
	sex: Sex,
	ageCategory: AgeCategory,
	gestationStatus: GestationStatus,
): GestationStatus {
	return canHaveGestation(sex, ageCategory) ? gestationStatus : "No"
}

export function deriveIsSheared(
	ageCategory: AgeCategory,
	gestationStatus: GestationStatus,
): boolean {
	return ageCategory !== "Cria" && gestationStatus !== "Si"
}
