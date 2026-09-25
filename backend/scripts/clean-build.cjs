const path = require("node:path")
const { rmSync } = require("node:fs")

const backendRoot = path.resolve(__dirname, "..")
const generatedPaths = [
	"build/admin",
	"build/admin-v2",
	"dist",
	"src/public/admin.css",
]

for (const generatedPath of generatedPaths) {
	rmSync(path.join(backendRoot, generatedPath), {
		force: true,
		recursive: true,
	})
}
