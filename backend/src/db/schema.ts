import { relations } from "drizzle-orm"
import {
	boolean,
	doublePrecision,
	integer,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core"

export const permits = pgTable("permits", {
	id: text("id").primaryKey(),
	date: text("date").notNull(),
	site: text("site").notNull(),
	authorizationCode: text("authorization_code").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const users = pgTable(
	"users",
	{
		id: text("id").primaryKey(),
		email: text("email").notNull(),
		passwordHash: text("password_hash").notNull(),
		role: text("role").notNull(),
		fullName: text("full_name").notNull(),
		isActive: boolean("is_active").notNull().default(true),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [uniqueIndex("users_email_unique").on(table.email)],
)

export const permitAssignments = pgTable(
	"permit_assignments",
	{
		id: text("id").primaryKey(),
		permitId: text("permit_id")
			.notNull()
			.references(() => permits.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		assignedAt: timestamp("assigned_at").notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex("permit_assignments_permit_user_unique").on(
			table.permitId,
			table.userId,
		),
	],
)

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

export const basicInfo = pgTable(
	"basic_info",
	{
		id: text("id").primaryKey(),
		permitId: text("permit_id")
			.notNull()
			.references(() => permits.id, { onDelete: "cascade" }),
		department: text("department").notNull(),
		regional: text("regional").notNull(),
		community: text("community").notNull(),
		site: text("site").notNull(),
		date: text("date").notNull(),
		isCompleted: boolean("is_completed").notNull(),
	},
	(table) => ({
		permitIdUnique: uniqueIndex("basic_info_permit_id_unique").on(
			table.permitId,
		),
	}),
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
	(table) => ({
		permitIdUnique: uniqueIndex("shearing_headers_permit_id_unique").on(
			table.permitId,
		),
	}),
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
	(table) => ({
		permitIdUnique: uniqueIndex("cleaning_headers_permit_id_unique").on(
			table.permitId,
		),
	}),
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
	(table) => ({
		cleaningCommonIdUnique: uniqueIndex(
			"grooming_details_cleaning_common_id_unique",
		).on(table.cleaningCommonId),
	}),
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
	(table) => ({
		cleaningCommonIdUnique: uniqueIndex(
			"dehearing_details_cleaning_common_id_unique",
		).on(table.cleaningCommonId),
	}),
)

export const permitRelations = relations(permits, ({ one, many }) => ({
	basicInfo: one(basicInfo),
	assignments: many(permitAssignments),
	participants: many(participants),
	shearingHeader: one(shearingHeaders),
	shearingRecords: many(shearingRecords),
	cleaningHeader: one(cleaningHeaders),
	cleaningCommonRecords: many(cleaningCommonRecords),
}))

export const userRelations = relations(users, ({ many }) => ({
	assignments: many(permitAssignments),
}))

export const permitAssignmentRelations = relations(
	permitAssignments,
	({ one }) => ({
		permit: one(permits, {
			fields: [permitAssignments.permitId],
			references: [permits.id],
		}),
		user: one(users, {
			fields: [permitAssignments.userId],
			references: [users.id],
		}),
	}),
)

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

export const communityRelations = relations(communities, ({ one }) => ({
	regional: one(regionals, {
		fields: [communities.regionalId],
		references: [regionals.id],
	}),
}))

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
