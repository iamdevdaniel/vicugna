import { useState } from "react"

export function useLoginState() {
	const [showPassword, setShowPassword] = useState(false)

	return {
		showPassword,
		togglePassword: () => setShowPassword((visible) => !visible),
	}
}
