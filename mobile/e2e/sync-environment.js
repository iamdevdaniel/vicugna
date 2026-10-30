const { spawn, spawnSync } = require("node:child_process")
const { randomUUID } = require("node:crypto")
const http = require("node:http")
const net = require("node:net")
const {
	backendDir,
	createE2eDatabaseClient,
	hashE2ePassword,
	prepareE2eEnvironment,
	removeE2eEnvironment,
} = require("../../backend/scripts/e2e.cjs")

// ==========================================
// TEST INFRASTRUCTURE AND FIXTURES
// ==========================================
const BACKEND_PORT = 3100
const MALFORMED_RESPONSE_PROXY_PORT = 3150
const PROXY_PORT = 3200
const TOXIPROXY_API_PORT = 8474
const TOXIPROXY_API_URL = `http://127.0.0.1:${TOXIPROXY_API_PORT}`
const TOXIPROXY_IMAGE = "ghcr.io/shopify/toxiproxy:2.12.0"
const TOXIPROXY_CONTAINER = "vicugna-android-sync-e2e"
const PROXY_NAME = "vicugna-backend"
const LOST_RESPONSE_TOXIC = "lost-backend-response"
const BACKEND_UPSTREAM = `host.docker.internal:${BACKEND_PORT}`
const MALFORMED_RESPONSE_UPSTREAM = `host.docker.internal:${MALFORMED_RESPONSE_PROXY_PORT}`
const TEST_USER_ID = "user-seed-03"
const TEST_USER_EMAIL = "lucia.choque@gmail.com"
const REPLACEMENT_SHEARING_RECORD_IDS = [
	"android-sync-replacement-shearing-1",
	"android-sync-replacement-shearing-2",
]

const SYNC_FIXTURES = [
	fixture(
		"handoff",
		"permit-seed-asg-02",
		"ASG-002",
		"910002",
		"shearing-record-e2e-monitoring-02",
		920002,
		"930002",
		"synced",
	),
	fixture(
		"local",
		"permit-seed-asg-03",
		"ASG-003",
		"910003",
		"shearing-record-e2e-monitoring-03",
		920003,
		"930003",
		"reopened",
	),
]

function fixture(
	key,
	id,
	permitNumber,
	identityNumber,
	shearingRecordId,
	tagNumber,
	fleeceNumber,
	syncStatus,
) {
	return {
		key,
		id,
		permitNumber,
		identityNumber,
		shearingRecordId,
		tagNumber,
		fleeceNumber,
		syncStatus,
	}
}

class AndroidSyncEnvironment {
	constructor() {
		this.e2eContext = null
		this.database = null
		this.backend = null
		this.malformedResponseProxy = null
		this.proxyStarted = false
		this.testUser = {
			email: TEST_USER_EMAIL,
			password: `android-sync-${randomUUID()}`,
		}
	}

	// ==========================================
	// ENVIRONMENT LIFECYCLE
	// ==========================================
	async start() {
		try {
			await assertPortAvailable(BACKEND_PORT)
			await assertPortAvailable(MALFORMED_RESPONSE_PROXY_PORT)
			await assertPortAvailable(PROXY_PORT)
			await assertPortAvailable(TOXIPROXY_API_PORT)
			this.e2eContext = await prepareE2eEnvironment()
			this.database = createE2eDatabaseClient(
				this.e2eContext.config.databaseUrl,
			)
			await this.database.connect()
			await this.setUniqueTestPassword()
			await this.startBackend()
			await this.startProxy()
		} catch (error) {
			await this.stop()
			throw error
		}
	}

	async stop() {
		await this.stopMalformedResponseProxy()
		await this.stopProxy()
		await this.stopBackend()

		if (this.database) {
			await this.database.end()
			this.database = null
		}

		if (this.e2eContext) {
			await removeE2eEnvironment(this.e2eContext)
			this.e2eContext = null
		}
	}

	async reset() {
		await this.resetProxy()
		await this.resetFixtures()
	}

	// ==========================================
	// SERVER FIXTURE STATE
	// ==========================================
	async reopen(permitNumber) {
		await this.setStatus(permitNumber, "reopened")
	}

	async cancelReopening(permitNumber) {
		await this.setStatus(permitNumber, "synced")
	}

	async setServerNotes(permitNumber, notes) {
		await this.dbQuery(
			`UPDATE participants
			 SET notes = $1
			 WHERE permit_id = (
				 SELECT id FROM permits WHERE permit_number = $2
			 )`,
			[notes, permitNumber],
		)
	}

	async setServerReplacementSnapshot(
		permitNumber,
		{ tagNumber, extraTagNumber, fleeceNumber },
	) {
		const permit = SYNC_FIXTURES.find(
			(item) => item.permitNumber === permitNumber,
		)
		if (!permit) throw new Error(`Unknown sync fixture: ${permitNumber}`)

		await this.dbQuery(
			"DELETE FROM shearing_records WHERE permit_id = $1",
			[permit.id],
		)
		await this.insertServerShearingRecord(
			REPLACEMENT_SHEARING_RECORD_IDS[0],
			permit.id,
			tagNumber,
			"First replacement server record",
		)
		await this.insertServerShearingRecord(
			REPLACEMENT_SHEARING_RECORD_IDS[1],
			permit.id,
			extraTagNumber,
			"Second replacement server record",
		)
		await this.dbQuery(
			`UPDATE cleaning_common_records
			 SET fleece_number = $1
			 WHERE permit_id = $2`,
			[fleeceNumber, permit.id],
		)
	}

	async insertServerShearingRecord(id, permitId, tagNumber, observations) {
		await this.dbQuery(
			`INSERT INTO shearing_records (
				id, permit_id, tag_number, sex, age_category, live_weight,
				fiber_length, body_condition, gestation_status,
				external_parasites, mange_severity, has_dandruff,
				is_sheared, is_dead, observations
			 ) VALUES ($1, $2, $3, 'M', 'Adulto', 39.5,
				4.2, 'Regular', 'No', ARRAY[]::text[], 'Ninguna', false,
				true, false, $4)`,
			[id, permitId, tagNumber, observations],
		)
	}

	async getServerNotes(permitNumber) {
		const result = await this.dbQuery(
			`SELECT participants.notes
			 FROM participants
			 JOIN permits ON permits.id = participants.permit_id
			 WHERE permits.permit_number = $1`,
			[permitNumber],
		)
		return result.rows[0]?.notes ?? null
	}

	async getStatus(permitNumber) {
		const result = await this.dbQuery(
			"SELECT sync_status FROM permits WHERE permit_number = $1",
			[permitNumber],
		)
		return result.rows[0]?.sync_status ?? null
	}

	async waitForStatus(permitNumber, expectedStatus) {
		await waitUntil(
			async () => (await this.getStatus(permitNumber)) === expectedStatus,
			`Permit ${permitNumber} did not become ${expectedStatus}`,
		)
	}

	async setTestUserActive(isActive) {
		await this.dbQuery("UPDATE users SET is_active = $1 WHERE id = $2", [
			isActive,
			TEST_USER_ID,
		])
	}

	async setUniqueTestPassword() {
		const passwordHash = await hashE2ePassword(this.testUser.password)
		const result = await this.dbQuery(
			"UPDATE users SET password_hash = $1, is_active = true WHERE id = $2",
			[passwordHash, TEST_USER_ID],
		)
		if (result.rowCount !== 1) {
			throw new Error("Could not set the unique Android E2E password")
		}
	}

	// ==========================================
	// TOXIPROXY AND BACKEND CONTROLS
	// ==========================================
	async startLostResponse() {
		await this.deleteLostResponseToxic()
		await toxiproxyRequest(`/proxies/${PROXY_NAME}/toxics`, {
			method: "POST",
			body: JSON.stringify({
				name: LOST_RESPONSE_TOXIC,
				type: "timeout",
				stream: "downstream",
				toxicity: 1,
				attributes: { timeout: 120_000 },
			}),
		})
	}

	async finishLostResponse() {
		await this.setProxyEnabled(false)
		await this.deleteLostResponseToxic()
		await this.setProxyEnabled(true)
	}

	async startMalformedResponse() {
		await this.stopMalformedResponseProxy()
		const proxy = createMalformedResponseProxy()
		await listen(proxy, MALFORMED_RESPONSE_PROXY_PORT)
		this.malformedResponseProxy = proxy
		await this.setProxyUpstream(MALFORMED_RESPONSE_UPSTREAM)
	}

	async finishMalformedResponse() {
		await this.setProxyUpstream(BACKEND_UPSTREAM)
		await this.stopMalformedResponseProxy()
	}

	async stopMalformedResponseProxy() {
		if (!this.malformedResponseProxy) return
		const proxy = this.malformedResponseProxy
		this.malformedResponseProxy = null
		await closeServer(proxy)
	}

	async startBackend() {
		this.backend = spawn(process.execPath, ["dist/server.js"], {
			cwd: backendDir,
			env: {
				...this.e2eContext.environment,
				PORT: String(BACKEND_PORT),
			},
			stdio: ["ignore", "inherit", "inherit"],
		})
		await waitForHttp(`http://127.0.0.1:${BACKEND_PORT}/mobile/permits`)
	}

	async stopBackend() {
		if (!this.backend) return
		const backend = this.backend
		this.backend = null
		backend.kill("SIGTERM")
		await waitForProcessExit(backend)
	}

	async startProxy() {
		const result = spawnSync(
			"docker",
			[
				"run",
				"--detach",
				"--rm",
				"--name",
				TOXIPROXY_CONTAINER,
				"--add-host",
				"host.docker.internal:host-gateway",
				"--publish",
				`127.0.0.1:${TOXIPROXY_API_PORT}:${TOXIPROXY_API_PORT}`,
				"--publish",
				`127.0.0.1:${PROXY_PORT}:${PROXY_PORT}`,
				TOXIPROXY_IMAGE,
			],
			{ encoding: "utf8" },
		)

		if (result.error) throw result.error
		if (result.status !== 0) {
			throw new Error(result.stderr.trim() || "Could not start Toxiproxy")
		}
		this.proxyStarted = true

		await waitForHttp(`${TOXIPROXY_API_URL}/version`)
		await toxiproxyRequest("/proxies", {
			method: "POST",
			body: JSON.stringify({
				name: PROXY_NAME,
				listen: `0.0.0.0:${PROXY_PORT}`,
				upstream: BACKEND_UPSTREAM,
			}),
		})
	}

	async stopProxy() {
		if (!this.proxyStarted) return
		spawnSync("docker", ["rm", "--force", TOXIPROXY_CONTAINER], {
			stdio: "ignore",
		})
		this.proxyStarted = false
	}

	async resetProxy() {
		await this.setProxyUpstream(BACKEND_UPSTREAM)
		await this.stopMalformedResponseProxy()
		await this.deleteLostResponseToxic()
		await this.setProxyEnabled(true)
	}

	async deleteLostResponseToxic() {
		await toxiproxyRequest(
			`/proxies/${PROXY_NAME}/toxics/${LOST_RESPONSE_TOXIC}`,
			{ method: "DELETE", allowNotFound: true },
		)
	}

	async setProxyEnabled(enabled) {
		await toxiproxyRequest(`/proxies/${PROXY_NAME}`, {
			method: "POST",
			body: JSON.stringify({ enabled }),
		})
	}

	async setProxyUpstream(upstream) {
		await toxiproxyRequest(`/proxies/${PROXY_NAME}`, {
			method: "POST",
			body: JSON.stringify({ upstream }),
		})
	}

	// ==========================================
	// FIXTURE RESTORATION
	// ==========================================
	async setStatus(permitNumber, status) {
		await this.dbQuery(
			`UPDATE permits
			 SET sync_status = $1, updated_at = NOW()
			 WHERE permit_number = $2`,
			[status, permitNumber],
		)
	}

	async resetFixtures() {
		const permitIds = SYNC_FIXTURES.map((item) => item.id)
		await this.dbQuery("BEGIN")
		try {
			await this.dbQuery(
				"DELETE FROM shearing_records WHERE permit_id = ANY($1::text[])",
				[permitIds],
			)
			await this.dbQuery(
				`DELETE FROM assignments
				 WHERE user_id = $1
				   AND NOT (permit_id = ANY($2::text[]))`,
				[TEST_USER_ID, permitIds],
			)
			await this.dbQuery(
				"UPDATE assignments SET user_id = $1 WHERE permit_id = ANY($2::text[])",
				[TEST_USER_ID, permitIds],
			)
			await this.dbQuery(
				"UPDATE users SET is_active = true WHERE id = $1",
				[TEST_USER_ID],
			)
			for (const item of SYNC_FIXTURES) {
				await this.setStatus(item.permitNumber, item.syncStatus)
				await this.setServerNotes(
					item.permitNumber,
					`Original server data ${item.permitNumber}`,
				)
				await this.insertServerShearingRecord(
					item.shearingRecordId,
					item.id,
					item.tagNumber,
					"Original server record",
				)
				await this.dbQuery(
					"UPDATE cleaning_common_records SET fleece_number = $1 WHERE permit_id = $2",
					[item.fleeceNumber, item.id],
				)
			}
			await this.dbQuery("COMMIT")
		} catch (error) {
			await this.dbQuery("ROLLBACK")
			throw error
		}
	}

	dbQuery(sql, parameters = []) {
		if (!this.database) throw new Error("The E2E database is not running")
		return this.database.query(sql, parameters)
	}
}

// ==========================================
// LOW-LEVEL NETWORK AND PROCESS HELPERS
// ==========================================
function createMalformedResponseProxy() {
	return http.createServer((request, response) => {
		const upstreamRequest = http.request(
			{
				hostname: "127.0.0.1",
				port: BACKEND_PORT,
				path: request.url,
				method: request.method,
				headers: request.headers,
			},
			(upstreamResponse) => {
				const responseChunks = []
				upstreamResponse.on("data", (chunk) =>
					responseChunks.push(chunk),
				)
				upstreamResponse.on("error", (error) => response.destroy(error))
				upstreamResponse.on("end", () => {
					const headers = { ...upstreamResponse.headers }
					delete headers["content-length"]
					delete headers["content-encoding"]
					delete headers["transfer-encoding"]

					if (
						request.method === "POST" &&
						request.url === "/permits/sync" &&
						upstreamResponse.statusCode === 200
					) {
						headers.connection = "close"
						response.writeHead(200, headers)
						response.end('{"ok":true,"data":')
						return
					}

					response.writeHead(
						upstreamResponse.statusCode ?? 500,
						headers,
					)
					response.end(Buffer.concat(responseChunks))
				})
			},
		)

		upstreamRequest.on("error", (error) => response.destroy(error))
		request.pipe(upstreamRequest)
	})
}

async function listen(server, port) {
	await new Promise((resolve, reject) => {
		const handleError = (error) => reject(error)
		server.once("error", handleError)
		server.listen(port, "0.0.0.0", () => {
			server.off("error", handleError)
			resolve()
		})
	})
}

async function closeServer(server) {
	await new Promise((resolve, reject) => {
		server.close((error) => {
			if (error) reject(error)
			else resolve()
		})
		server.closeAllConnections?.()
	})
}

async function toxiproxyRequest(pathname, options = {}) {
	const { allowNotFound = false, ...requestOptions } = options
	const response = await fetch(`${TOXIPROXY_API_URL}${pathname}`, {
		...requestOptions,
		headers: { "Content-Type": "application/json" },
	})
	if (allowNotFound && response.status === 404) return
	if (!response.ok) {
		throw new Error(
			`Toxiproxy ${requestOptions.method ?? "GET"} ${pathname} failed: ${response.status} ${await response.text()}`,
		)
	}
}

async function waitForHttp(url) {
	await waitUntil(async () => {
		try {
			await fetch(url)
			return true
		} catch {
			return false
		}
	}, `Timed out waiting for ${url}`)
}

async function assertPortAvailable(port) {
	await new Promise((resolve, reject) => {
		const server = net.createServer()
		server.once("error", () => {
			reject(new Error(`Port ${port} is already in use`))
		})
		server.listen(port, "127.0.0.1", () => {
			server.close(resolve)
		})
	})
}

async function waitUntil(check, message, timeout = 30_000) {
	const deadline = Date.now() + timeout
	while (Date.now() < deadline) {
		if (await check()) return
		await new Promise((resolve) => setTimeout(resolve, 100))
	}
	throw new Error(message)
}

async function waitForProcessExit(child) {
	if (child.exitCode !== null) return
	await Promise.race([
		new Promise((resolve) => child.once("exit", resolve)),
		new Promise((resolve) => setTimeout(resolve, 5_000)),
	])
	if (child.exitCode === null) child.kill("SIGKILL")
}

module.exports = {
	AndroidSyncEnvironment,
	SYNC_FIXTURES,
}
