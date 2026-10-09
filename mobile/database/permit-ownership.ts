export function assertPermitOwner(
	permitUserId: string,
	accountId: string,
): void {
	if (permitUserId !== accountId) {
		throw new Error("El permiso no pertenece a la cuenta activa")
	}
}
