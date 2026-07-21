export interface MobileLoginRequestBody {
	email: string
	password: string
}

export interface MobileSessionUser {
	id: string
	email: string
	fullName: string
	role: "user"
	avatarSeed: string
}

export interface MobileLoginResult {
	token: string
	expiresAt: string
	user: MobileSessionUser
}

export interface MobileAuthTokenPayload {
	sub: string
	role: "user"
	exp: number
}
