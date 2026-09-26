const { device } = require("detox")
const {
	byLabel,
	byPressableLabel,
	byText,
	drawSignature,
	expectChecked,
	expectEnabled,
	expectFieldValue,
	getFieldValue,
	replaceField,
	setTime,
	tapLabel,
	tapLabelContaining,
	tapText,
	waitForFieldValueChange,
} = require("./support")

function expectCalendarDateFormat(value, label) {
	if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
		throw new Error(`${label} should use DD/MM/YYYY, found ${value}`)
	}
}

async function addParticipant(participant) {
	await tapLabel("Añadir participante")
	await replaceField("Participante: nombre", participant.name)
	await replaceField("Participante: apellidos", participant.lastNames)
	await tapLabel(`Participante: género: ${participant.gender}`)
	await replaceField("Participante: cédula", participant.identityNumber)
	await drawSignature()
	await replaceField("Participante: notas", participant.notes)
	await expectEnabled("Guardar participante", true)
	await tapLabel("Guardar participante")
	await byPressableLabel("Añadir participante")
}

async function verifyParticipant(participant) {
	await tapLabelContaining(`cédula ${participant.identityNumber}`)
	await expectFieldValue("Participante: nombre", participant.name)
	await expectFieldValue("Participante: apellidos", participant.lastNames)
	await expectChecked(`Participante: género: ${participant.gender}`, true)
	await expectFieldValue("Participante: cédula", participant.identityNumber)
	await byLabel("Firma registrada")
	await expectFieldValue("Participante: notas", participant.notes)
	await device.pressBack()
}

async function fillShearingHeader() {
	await tapLabel("Abrir Información general")
	await replaceField("Esquila general: sitio", "Corral E2E")
	await replaceField("Esquila general: latitud", "-21.53")
	await replaceField("Esquila general: longitud", "-67.12")
	await replaceField("Esquila general: cantidad de arreos", "4")
	const previousEventDate = await getFieldValue("Esquila general: fecha")
	await tapLabel("Usar hoy para fecha de esquila")
	const eventDate = await waitForFieldValueChange(
		"Esquila general: fecha",
		previousEventDate,
	)
	expectCalendarDateFormat(eventDate, "Esquila general: fecha")
	await setTime("Esquila general: hora inicial", 8, 0)
	await setTime("Esquila general: hora conclusión", 10, 0)
	await expectEnabled("Guardar información general de esquila", true)
	await tapLabel("Guardar información general de esquila")
	await byPressableLabel("Añadir registro de esquila")
	return eventDate
}

async function verifyShearingHeader(eventDate) {
	await tapText("Información general")
	await expectFieldValue("Esquila general: sitio", "Corral E2E")
	await expectFieldValue("Esquila general: latitud", "-21.53")
	await expectFieldValue("Esquila general: longitud", "-67.12")
	await expectFieldValue("Esquila general: cantidad de arreos", "4")
	await expectFieldValue("Esquila general: fecha", eventDate)
	await expectFieldValue("Esquila general: hora inicial", "8:00 AM")
	await expectFieldValue("Esquila general: hora conclusión", "10:00 AM")
	await device.pressBack()
}

async function addShearingRecord(record) {
	await tapLabel("Añadir registro de esquila")
	await replaceField("Esquila: número de arete", record.tagNumber)
	await tapLabel(`Esquila: sexo: ${record.sex}`)
	await tapLabel(`Esquila: edad: ${record.age}`)
	await replaceField("Esquila: peso vivo", record.liveWeight)
	await replaceField("Esquila: longitud de fibra", record.fiberLength)
	await tapLabel(`Esquila: condición corporal: ${record.condition}`)
	if (record.gestation !== "No") {
		await tapLabel(`Esquila: gestación: ${record.gestation}`)
	}
	for (const parasite of record.parasites) {
		await tapLabel(`Esquila: parásitos externos: ${parasite}`)
	}
	await tapLabel(`Esquila: sarna: ${record.mange}`)
	if (record.dandruff) await tapLabel("Esquila: caspa: Si")
	if (record.dead) await tapLabel("Esquila: muerto: Si")
	await replaceField("Esquila: observaciones", record.observations)
	await expectEnabled("Guardar registro de esquila", true)
	await tapLabel("Guardar registro de esquila")
	await byPressableLabel("Añadir registro de esquila")
}

async function verifyShearingRecord(record) {
	await tapLabelContaining(`Registro de esquila ${record.tagNumber}`)
	await expectFieldValue("Esquila: número de arete", record.tagNumber)
	await expectChecked(`Esquila: sexo: ${record.sex}`, true)
	await expectChecked(`Esquila: edad: ${record.age}`, true)
	await expectFieldValue("Esquila: peso vivo", record.liveWeight)
	await expectFieldValue("Esquila: longitud de fibra", record.fiberLength)
	await expectChecked(
		`Esquila: condición corporal: ${record.condition}`,
		true,
	)
	await expectChecked(`Esquila: gestación: ${record.gestation}`, true)
	for (const parasite of ["Garrapata", "Piojos"]) {
		await expectChecked(
			`Esquila: parásitos externos: ${parasite}`,
			record.parasites.includes(parasite),
		)
	}
	await expectChecked(`Esquila: sarna: ${record.mange}`, true)
	await expectChecked("Esquila: caspa: Si", record.dandruff)
	await expectChecked("Esquila: muerto: Si", record.dead)
	await expectChecked(
		"Esquila: esquilado: Si",
		record.age !== "Cria" && record.gestation !== "Si",
	)
	await expectFieldValue("Esquila: observaciones", record.observations)
	await device.pressBack()
}

async function fillCleaningHeader() {
	await tapLabel("Abrir Información general")
	const previousStartDate = await getFieldValue("Fibra general: fecha inicio")
	await tapLabel("Usar hoy para fecha inicio de fibra")
	const startDate = await waitForFieldValueChange(
		"Fibra general: fecha inicio",
		previousStartDate,
	)
	expectCalendarDateFormat(startDate, "Fibra general: fecha inicio")
	const previousEndDate = await getFieldValue(
		"Fibra general: fecha conclusión",
	)
	await tapLabel("Usar hoy para fecha conclusión de fibra")
	const endDate = await waitForFieldValueChange(
		"Fibra general: fecha conclusión",
		previousEndDate,
	)
	expectCalendarDateFormat(endDate, "Fibra general: fecha conclusión")
	await replaceField("Fibra general: lugar", "Centro E2E")
	await replaceField("Fibra general: responsables", "Equipo de prueba")
	await expectEnabled("Guardar información general de fibra", true)
	await tapLabel("Guardar información general de fibra")
	await byPressableLabel("Añadir registro de fibra")
	return { startDate, endDate }
}

async function verifyCleaningHeader(dates) {
	await tapText("Información general")
	await expectFieldValue("Fibra general: fecha inicio", dates.startDate)
	await expectFieldValue("Fibra general: fecha conclusión", dates.endDate)
	await expectFieldValue("Fibra general: lugar", "Centro E2E")
	await expectFieldValue("Fibra general: responsables", "Equipo de prueba")
	await device.pressBack()
}

async function addFiberRecord(record) {
	await tapLabel("Añadir registro de fibra")
	await replaceField("Fibra: número de vellón", record.fleeceNumber)
	await replaceField("Fibra: peso bruto", record.grossWeight)
	await expectEnabled("Guardar registro de fibra", true)
	await tapLabel("Guardar registro de fibra")

	await tapLabel(`Continuar registro de fibra ${record.fleeceNumber}`)
	if (record.type === "Predescerdado") {
		await tapLabel("Fibra: tipo: Predescerdado")
		await replaceField("Fibra: peso predescerdado", record.dehairedWeight)
		await replaceField("Fibra: peso cerda", record.bristleWeight)
		if (record.dandruff) await tapLabel("Fibra: caspa: Si")
		await replaceField(
			"Fibra: nombre del predescerdador",
			record.dehairerName,
		)
		await drawSignature()
	} else {
		await replaceField("Fibra: peso vellón limpio", record.cleanWeight)
		await replaceField("Fibra: peso braga", record.dirtyWeight)
	}

	await expectEnabled("Guardar registro de fibra", true)
	await tapLabel("Guardar registro de fibra")
	await byPressableLabel("Añadir registro de fibra")
}

async function verifyFiberRecord(record) {
	await tapLabel(`Editar registro de fibra ${record.fleeceNumber}`)
	await expectFieldValue("Fibra: número de vellón", record.fleeceNumber)
	await expectFieldValue("Fibra: peso bruto", record.grossWeight)
	await expectChecked(`Fibra: tipo: ${record.type}`, true)

	if (record.type === "Predescerdado") {
		await expectFieldValue(
			"Fibra: peso predescerdado",
			record.dehairedWeight,
		)
		await expectFieldValue("Fibra: peso cerda", record.bristleWeight)
		await expectChecked("Fibra: caspa: Si", record.dandruff)
		await expectFieldValue(
			"Fibra: nombre del predescerdador",
			record.dehairerName,
		)
		await byLabel("Firma registrada")
	} else {
		await expectFieldValue("Fibra: peso vellón limpio", record.cleanWeight)
		await expectFieldValue("Fibra: peso braga", record.dirtyWeight)
		await expectFieldValue("Fibra: peso total", record.totalWeight)
	}

	await device.pressBack()
}

async function openWorkflowStep(title) {
	await tapLabel(`Abrir ${title}`)
}

async function expectTotal(total) {
	await byText(`Total ${total}`)
}

module.exports = {
	addFiberRecord,
	addParticipant,
	addShearingRecord,
	expectTotal,
	fillCleaningHeader,
	fillShearingHeader,
	openWorkflowStep,
	verifyCleaningHeader,
	verifyFiberRecord,
	verifyParticipant,
	verifyShearingHeader,
	verifyShearingRecord,
}
