declare module "../vendor/jdenticon.min.js" {
	const jdenticon: {
		toSvg: (value: string, size: number) => string
	}

	export default jdenticon
}
