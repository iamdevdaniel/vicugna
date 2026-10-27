const { z } = require("zod");

const participantSchema = z
	.object({
		id: z.string(),
		permitId: z.string(),
		name: z.string(),
		lastNames: z.string(),
		gender: z.enum(["M", "F"]),
		identityNumber: z.string(),
		signature: z.string(),
		notes: z.string(),
	})
	.strict();

const shearingHeaderSchema = z
	.object({
		id: z.string(),
		permitId: z.string(),
		site: z.string(),
		latitude: z.number(),
		longitude: z.number(),
		roundupCount: z.number(),
		eventDate: z.string(),
		startTime: z.string(),
		endTime: z.string(),
		isCompleted: z.boolean(),
	})
	.strict();

const shearingRecordSchema = z
	.object({
		id: z.string(),
		permitId: z.string(),
		tagNumber: z.number(),
		sex: z.enum(["F", "M"]),
		ageCategory: z.enum(["Cria", "Juvenil", "Adulto"]),
		liveWeight: z.number(),
		fiberLength: z.number(),
		bodyCondition: z.enum(["Malo", "Regular", "Bueno"]),
		gestationStatus: z.enum(["No", "Si", "Si ultimo tercio"]),
		externalParasites: z.array(z.enum(["Garrapata", "Piojos"])),
		mangeSeverity: z.enum(["Ninguna", "Leve", "Moderado", "Severo"]),
		hasDandruff: z.boolean(),
		isSheared: z.boolean(),
		isDead: z.boolean(),
		observations: z.string(),
	})
	.strict();

const cleaningHeaderSchema = z
	.object({
		id: z.string(),
		permitId: z.string(),
		startDate: z.string(),
		endDate: z.string(),
		site: z.string(),
		supervisors: z.string(),
		isCompleted: z.boolean(),
	})
	.strict();

const cleaningCommonSchema = z
	.object({
		id: z.string(),
		permitId: z.string(),
		fleeceNumber: z.string(),
		grossWeight: z.number(),
	})
	.strict();

const groomingSchema = z
	.object({
		id: z.string(),
		cleaningCommonId: z.string(),
		cleanWeight: z.number(),
		dirtyWeight: z.number(),
		totalWeight: z.number(),
		isCompleted: z.boolean(),
	})
	.strict();

const dehearingSchema = z
	.object({
		id: z.string(),
		cleaningCommonId: z.string(),
		dehairedWeight: z.number(),
		bristleWeight: z.number(),
		hasDandruff: z.boolean(),
		dehairerName: z.string(),
		signature: z.string(),
		isCompleted: z.boolean(),
	})
	.strict();

const permitFieldDataSchema = z
	.object({
		participants: z.array(participantSchema),
		shearingHeader: shearingHeaderSchema,
		shearingRecords: z.array(shearingRecordSchema),
		cleaningHeader: cleaningHeaderSchema,
		cleaningCommonRecords: z.array(cleaningCommonSchema),
		groomingDetails: z.array(groomingSchema),
		dehearingDetails: z.array(dehearingSchema),
	})
	.strict();

function parsePermitDataShape(value) {
	return permitFieldDataSchema.safeParse(value);
}

module.exports = { parsePermitDataShape };
