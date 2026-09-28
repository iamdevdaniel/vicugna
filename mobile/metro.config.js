const { getDefaultConfig } = require("expo/metro-config")

const config = getDefaultConfig(__dirname)
// Zustand's ESM middleware uses import.meta, which Metro development bundles cannot run.
const zustandMiddlewarePath = require.resolve("zustand/middleware")

config.resolver.resolveRequest = (context, moduleName, platform) => {
	if (moduleName === "zustand/middleware") {
		return {
			filePath: zustandMiddlewarePath,
			type: "sourceFile",
		}
	}

	return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
