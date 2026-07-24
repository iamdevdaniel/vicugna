import { relations, sql } from "drizzle-orm"
import {
	boolean,
	doublePrecision,
	index,
	integer,
	json,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core"

// ==========================================
// TABLES
// ==========================================

export const departments = pgTable("departments", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
})

export const regionals = pgTable("regionals", {
	id: text("id").primaryKey(),
	departmentId: text("department_id")
		.notNull()
		.references(() => departments.id),
	name: text("name").notNull(),
})

export const communities = pgTable("communities", {
	id: text("id").primaryKey(),
	regionalId: text("regional_id")
		.notNull()
		.references(() => regionals.id),
	name: text("name").notNull(),
})

export const seasons = pgTable("seasons", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	startDate: text("start_date").notNull(),
	endDate: text("end_date").notNull(),
	isActive: boolean("is_active").notNull().default(true),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const users = pgTable(
	"users",
	{
		id: text("id").primaryKey(),
		fullName: text("full_name").notNull(),
		phoneNumber: text("phone_number").notNull(),
		email: text("email"),
		passwordHash: text("password_hash").notNull(),
		role: text("role").notNull(),
		isActive: boolean("is_active").notNull().default(true),
		avatarSeed: text("avatar_seed").notNull(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex("users_email_unique").on(table.email),
		uniqueIndex("users_phone_number_unique").on(table.phoneNumber),
	],
)

export const sessions = pgTable(
	"session",
	{
		sid: varchar("sid").primaryKey(),
		sess: json("sess").notNull(),
		expire: timestamp("expire", { precision: 6 }).notNull(),
	},
	(table) => [index("IDX_session_expire").on(table.expire)],
)

export const permits = pgTable(
	"permits",
	{
		id: text("id").primaryKey(),
		seasonId: text("season_id")
			.notNull()
			.references(() => seasons.id),
		communityId: text("community_id")
			.notNull()
			.references(() => communities.id),
		permitNumber: text("permit_number").notNull(),
		isSynced: boolean("is_synced").notNull().default(false),
		syncedAt: timestamp("synced_at"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex("permits_season_permit_number_unique").on(
			table.seasonId,
			table.permitNumber,
		),
	],
)

export const assignments = pgTable(
	"assignments",
	{
		id: text("id").primaryKey(),
		seasonId: text("season_id")
			.notNull()
			.references(() => seasons.id, { onDelete: "cascade" }),
		communityId: text("community_id")
			.notNull()
			.references(() => communities.id),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		permitId: text("permit_id")
			.notNull()
			.references(() => permits.id, { onDelete: "cascade" }),
		position: integer("position").notNull(),
		active: boolean("active").notNull().default(false),
		assignedAt: timestamp("assigned_at").notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex("assignments_season_community_user_permit_unique").on(
			table.seasonId,
			table.communityId,
			table.userId,
			table.permitId,
		),
		uniqueIndex("assignments_active_permit_unique")
			.on(table.permitId)
			.where(sql`${table.active} = true`),
	],
)

export const participants = pgTable("participants", {
	id: text("id").primaryKey(),
	permitId: text("permit_id")
		.notNull()
		.references(() => permits.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	lastNames: text("last_names").notNull(),
	gender: text("gender").notNull(),
	identityNumber: text("identity_number").notNull(),
	signature: text("signature").notNull(),
	notes: text("notes").notNull(),
})

export const shearingHeaders = pgTable(
	"shearing_headers",
	{
		id: text("id").primaryKey(),
		permitId: text("permit_id")
			.notNull()
			.references(() => permits.id, { onDelete: "cascade" }),
		site: text("site").notNull(),
		latitude: doublePrecision("latitude").notNull(),
		longitude: doublePrecision("longitude").notNull(),
		roundupCount: integer("roundup_count").notNull(),
		startTime: text("start_time").notNull(),
		endTime: text("end_time").notNull(),
		isCompleted: boolean("is_completed").notNull(),
	},
	(table) => [
		uniqueIndex("shearing_headers_permit_id_unique").on(table.permitId),
	],
)

export const shearingRecords = pgTable("shearing_records", {
	id: text("id").primaryKey(),
	permitId: text("permit_id")
		.notNull()
		.references(() => permits.id, { onDelete: "cascade" }),
	tagNumber: integer("tag_number").notNull(),
	sex: text("sex").notNull(),
	ageCategory: text("age_category").notNull(),
	liveWeight: doublePrecision("live_weight").notNull(),
	fiberLength: doublePrecision("fiber_length").notNull(),
	bodyCondition: text("body_condition").notNull(),
	gestationStatus: text("gestation_status").notNull(),
	externalParasites: text("external_parasites").notNull(),
	mangeSeverity: text("mange_severity").notNull(),
	hasDandruff: boolean("has_dandruff").notNull(),
	isSheared: boolean("is_sheared").notNull(),
	isDead: boolean("is_dead").notNull(),
	observations: text("observations").notNull(),
})

export const cleaningHeaders = pgTable(
	"cleaning_headers",
	{
		id: text("id").primaryKey(),
		permitId: text("permit_id")
			.notNull()
			.references(() => permits.id, { onDelete: "cascade" }),
		startDate: text("start_date").notNull(),
		endDate: text("end_date").notNull(),
		site: text("site").notNull(),
		supervisors: text("supervisors").notNull(),
		isCompleted: boolean("is_completed").notNull(),
	},
	(table) => [
		uniqueIndex("cleaning_headers_permit_id_unique").on(table.permitId),
	],
)

export const cleaningCommonRecords = pgTable("cleaning_common_records", {
	id: text("id").primaryKey(),
	permitId: text("permit_id")
		.notNull()
		.references(() => permits.id, { onDelete: "cascade" }),
	fleeceNumber: text("fleece_number").notNull(),
	grossWeight: doublePrecision("gross_weight").notNull(),
})

export const groomingDetails = pgTable(
	"grooming_details",
	{
		id: text("id").primaryKey(),
		cleaningCommonId: text("cleaning_common_id")
			.notNull()
			.references(() => cleaningCommonRecords.id, {
				onDelete: "cascade",
			}),
		cleanWeight: doublePrecision("clean_weight").notNull(),
		dirtyWeight: doublePrecision("dirty_weight").notNull(),
		totalWeight: doublePrecision("total_weight").notNull(),
		isCompleted: boolean("is_completed").notNull(),
	},
	(table) => [
		uniqueIndex("grooming_details_cleaning_common_id_unique").on(
			table.cleaningCommonId,
		),
	],
)

export const dehearingDetails = pgTable(
	"dehearing_details",
	{
		id: text("id").primaryKey(),
		cleaningCommonId: text("cleaning_common_id")
			.notNull()
			.references(() => cleaningCommonRecords.id, {
				onDelete: "cascade",
			}),
		dehairedWeight: doublePrecision("dehaired_weight").notNull(),
		bristleWeight: doublePrecision("bristle_weight").notNull(),
		hasDandruff: boolean("has_dandruff").notNull(),
		dehairerName: text("dehairer_name").notNull(),
		signature: text("signature").notNull(),
		isCompleted: boolean("is_completed").notNull(),
	},
	(table) => [
		uniqueIndex("dehearing_details_cleaning_common_id_unique").on(
			table.cleaningCommonId,
		),
	],
)

// ==========================================
// RELATIONS
// ==========================================

export const seasonRelations = relations(seasons, ({ many }) => ({
	assignments: many(assignments),
	permits: many(permits),
}))

export const departmentRelations = relations(departments, ({ many }) => ({
	regionals: many(regionals),
}))

export const regionalRelations = relations(regionals, ({ one, many }) => ({
	department: one(departments, {
		fields: [regionals.departmentId],
		references: [departments.id],
	}),
	communities: many(communities),
}))

export const communityRelations = relations(communities, ({ one, many }) => ({
	regional: one(regionals, {
		fields: [communities.regionalId],
		references: [regionals.id],
	}),
	assignments: many(assignments),
	permits: many(permits),
}))

export const userRelations = relations(users, ({ many }) => ({
	assignments: many(assignments),
}))

export const assignmentRelations = relations(assignments, ({ one }) => ({
	season: one(seasons, {
		fields: [assignments.seasonId],
		references: [seasons.id],
	}),
	community: one(communities, {
		fields: [assignments.communityId],
		references: [communities.id],
	}),
	user: one(users, {
		fields: [assignments.userId],
		references: [users.id],
	}),
	permit: one(permits, {
		fields: [assignments.permitId],
		references: [permits.id],
	}),
}))

export const permitRelations = relations(permits, ({ one, many }) => ({
	season: one(seasons, {
		fields: [permits.seasonId],
		references: [seasons.id],
	}),
	community: one(communities, {
		fields: [permits.communityId],
		references: [communities.id],
	}),
	assignments: many(assignments),
	participants: many(participants),
	shearingHeader: one(shearingHeaders),
	shearingRecords: many(shearingRecords),
	cleaningHeader: one(cleaningHeaders),
	cleaningCommonRecords: many(cleaningCommonRecords),
}))

export const participantRelations = relations(participants, ({ one }) => ({
	permit: one(permits, {
		fields: [participants.permitId],
		references: [permits.id],
	}),
}))

export const shearingHeaderRelations = relations(
	shearingHeaders,
	({ one }) => ({
		permit: one(permits, {
			fields: [shearingHeaders.permitId],
			references: [permits.id],
		}),
	}),
)

export const shearingRecordRelations = relations(
	shearingRecords,
	({ one }) => ({
		permit: one(permits, {
			fields: [shearingRecords.permitId],
			references: [permits.id],
		}),
	}),
)

export const cleaningHeaderRelations = relations(
	cleaningHeaders,
	({ one }) => ({
		permit: one(permits, {
			fields: [cleaningHeaders.permitId],
			references: [permits.id],
		}),
	}),
)

export const cleaningCommonRecordRelations = relations(
	cleaningCommonRecords,
	({ one }) => ({
		permit: one(permits, {
			fields: [cleaningCommonRecords.permitId],
			references: [permits.id],
		}),
		grooming: one(groomingDetails),
		dehearing: one(dehearingDetails),
	}),
)
