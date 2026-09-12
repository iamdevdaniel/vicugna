import {
	byLabel,
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
} from "./support.mjs"

async function hideKeyboard(driver) {
	await driver.hideKeyboard().catch(() => false)
}

export async function addParticipant(driver, participant) {
	await tapLabel(driver, "Añadir participante")
	await replaceField(driver, "Participante: nombre", participant.name)
	await replaceField(driver, "Participante: apellidos", participant.lastNames)
	await tapLabel(driver, `Participante: género: ${participant.gender}`)
	await replaceField(
		driver,
		"Participante: cédula",
		participant.identityNumber,
	)
	await hideKeyboard(driver)
	await drawSignature(driver)
	await replaceField(driver, "Participante: notas", participant.notes)
	await hideKeyboard(driver)
	await expectEnabled(driver, "Guardar participante", true)
	await tapLabel(driver, "Guardar participante")
	await byLabel(driver, "Añadir participante")
}

export async function verifyParticipant(driver, participant) {
	await tapLabelContaining(driver, `cédula ${participant.identityNumber}`)
	await expectFieldValue(driver, "Participante: nombre", participant.name)
	await expectFieldValue(
		driver,
		"Participante: apellidos",
		participant.lastNames,
	)
	await expectChecked(
		driver,
		`Participante: género: ${participant.gender}`,
		true,
	)
	await expectFieldValue(
		driver,
		"Participante: cédula",
		participant.identityNumber,
	)
	await byLabel(driver, "Firma registrada")
	await expectFieldValue(driver, "Participante: notas", participant.notes)
	await driver.back()
}

export async function fillShearingHeader(driver) {
	await tapLabel(driver, "Abrir Información general")
	await replaceField(driver, "Esquila general: sitio", "Corral E2E")
	await replaceField(driver, "Esquila general: latitud", "-21.53")
	await replaceField(driver, "Esquila general: longitud", "-67.12")
	await replaceField(driver, "Esquila general: cantidad de arreos", "4")
	await hideKeyboard(driver)
	const previousEventDate = await getFieldValue(
		driver,
		"Esquila general: fecha",
	)
	await tapLabel(driver, "Usar hoy para fecha de esquila")
	const eventDate = await waitForFieldValueChange(
		driver,
		"Esquila general: fecha",
		previousEventDate,
	)
	await setTime(driver, "Esquila general: hora inicial", 8, 0)
	await setTime(driver, "Esquila general: hora conclusión", 10, 0)
	await expectEnabled(driver, "Guardar información general de esquila", true)
	await tapLabel(driver, "Guardar información general de esquila")
	await byLabel(driver, "Añadir registro de esquila")
	return eventDate
}

export async function verifyShearingHeader(driver, eventDate) {
	await tapText(driver, "Información general")
	await expectFieldValue(driver, "Esquila general: sitio", "Corral E2E")
	await expectFieldValue(driver, "Esquila general: latitud", "-21.53")
	await expectFieldValue(driver, "Esquila general: longitud", "-67.12")
	await expectFieldValue(driver, "Esquila general: cantidad de arreos", "4")
	await expectFieldValue(driver, "Esquila general: fecha", eventDate)
	await expectFieldValue(driver, "Esquila general: hora inicial", "8:00 AM")
	await expectFieldValue(
		driver,
		"Esquila general: hora conclusión",
		"10:00 AM",
	)
	await driver.back()
}

export async function addShearingRecord(driver, record) {
	await tapLabel(driver, "Añadir registro de esquila")
	await replaceField(driver, "Esquila: número de arete", record.tagNumber)
	await tapLabel(driver, `Esquila: sexo: ${record.sex}`)
	await tapLabel(driver, `Esquila: edad: ${record.age}`)
	await replaceField(driver, "Esquila: peso vivo", record.liveWeight)
	await replaceField(driver, "Esquila: longitud de fibra", record.fiberLength)
	await hideKeyboard(driver)
	await tapLabel(driver, `Esquila: condición corporal: ${record.condition}`)
	if (record.gestation !== "No") {
		await tapLabel(driver, `Esquila: gestación: ${record.gestation}`)
	}
	for (const parasite of record.parasites) {
		await tapLabel(driver, `Esquila: parásitos externos: ${parasite}`)
	}
	await tapLabel(driver, `Esquila: sarna: ${record.mange}`)
	if (record.dandruff) await tapLabel(driver, "Esquila: caspa: Si")
	if (record.dead) await tapLabel(driver, "Esquila: muerto: Si")
	await replaceField(driver, "Esquila: observaciones", record.observations)
	await hideKeyboard(driver)
	await expectEnabled(driver, "Guardar registro de esquila", true)
	await tapLabel(driver, "Guardar registro de esquila")
	await byLabel(driver, "Añadir registro de esquila")
}

export async function verifyShearingRecord(driver, record) {
	await tapLabelContaining(driver, `Registro de esquila ${record.tagNumber}`)
	await expectFieldValue(driver, "Esquila: número de arete", record.tagNumber)
	await expectChecked(driver, `Esquila: sexo: ${record.sex}`, true)
	await expectChecked(driver, `Esquila: edad: ${record.age}`, true)
	await expectFieldValue(driver, "Esquila: peso vivo", record.liveWeight)
	await expectFieldValue(
		driver,
		"Esquila: longitud de fibra",
		record.fiberLength,
	)
	await expectChecked(
		driver,
		`Esquila: condición corporal: ${record.condition}`,
		true,
	)
	await expectChecked(driver, `Esquila: gestación: ${record.gestation}`, true)
	for (const parasite of ["Garrapata", "Piojos"]) {
		await expectChecked(
			driver,
			`Esquila: parásitos externos: ${parasite}`,
			record.parasites.includes(parasite),
		)
	}
	await expectChecked(driver, `Esquila: sarna: ${record.mange}`, true)
	await expectChecked(driver, "Esquila: caspa: Si", record.dandruff)
	await expectChecked(driver, "Esquila: muerto: Si", record.dead)
	await expectChecked(
		driver,
		"Esquila: esquilado: Si",
		record.age !== "Cria" && record.gestation !== "Si",
	)
	await expectFieldValue(
		driver,
		"Esquila: observaciones",
		record.observations,
	)
	await driver.back()
}

export async function fillCleaningHeader(driver) {
	await tapLabel(driver, "Abrir Información general")
	const previousStartDate = await getFieldValue(
		driver,
		"Fibra general: fecha inicio",
	)
	await tapLabel(driver, "Usar hoy para fecha inicio de fibra")
	const startDate = await waitForFieldValueChange(
		driver,
		"Fibra general: fecha inicio",
		previousStartDate,
	)
	const previousEndDate = await getFieldValue(
		driver,
		"Fibra general: fecha conclusión",
	)
	await tapLabel(driver, "Usar hoy para fecha conclusión de fibra")
	const endDate = await waitForFieldValueChange(
		driver,
		"Fibra general: fecha conclusión",
		previousEndDate,
	)
	await replaceField(driver, "Fibra general: lugar", "Centro E2E")
	await replaceField(
		driver,
		"Fibra general: responsables",
		"Equipo de prueba",
	)
	await hideKeyboard(driver)
	await expectEnabled(driver, "Guardar información general de fibra", true)
	await tapLabel(driver, "Guardar información general de fibra")
	await byLabel(driver, "Añadir registro de fibra")
	return { startDate, endDate }
}

export async function verifyCleaningHeader(driver, dates) {
	await tapText(driver, "Información general")
	await expectFieldValue(
		driver,
		"Fibra general: fecha inicio",
		dates.startDate,
	)
	await expectFieldValue(
		driver,
		"Fibra general: fecha conclusión",
		dates.endDate,
	)
	await expectFieldValue(driver, "Fibra general: lugar", "Centro E2E")
	await expectFieldValue(
		driver,
		"Fibra general: responsables",
		"Equipo de prueba",
	)
	await driver.back()
}

export async function addFiberRecord(driver, record) {
	await tapLabel(driver, "Añadir registro de fibra")
	await replaceField(driver, "Fibra: número de vellón", record.fleeceNumber)
	await replaceField(driver, "Fibra: peso bruto", record.grossWeight)
	await hideKeyboard(driver)
	await expectEnabled(driver, "Guardar registro de fibra", true)
	await tapLabel(driver, "Guardar registro de fibra")

	await tapLabel(driver, `Continuar registro de fibra ${record.fleeceNumber}`)
	if (record.type === "Predescerdado") {
		await tapLabel(driver, "Fibra: tipo: Predescerdado")
		await replaceField(
			driver,
			"Fibra: peso predescerdado",
			record.dehairedWeight,
		)
		await replaceField(driver, "Fibra: peso cerda", record.bristleWeight)
		if (record.dandruff) await tapLabel(driver, "Fibra: caspa: Si")
		await replaceField(
			driver,
			"Fibra: nombre del predescerdador",
			record.dehairerName,
		)
		await hideKeyboard(driver)
		await drawSignature(driver)
	} else {
		await replaceField(
			driver,
			"Fibra: peso vellón limpio",
			record.cleanWeight,
		)
		await replaceField(driver, "Fibra: peso braga", record.dirtyWeight)
		await hideKeyboard(driver)
	}

	await expectEnabled(driver, "Guardar registro de fibra", true)
	await tapLabel(driver, "Guardar registro de fibra")
	await byLabel(driver, "Añadir registro de fibra")
}

export async function verifyFiberRecord(driver, record) {
	await tapLabel(driver, `Editar registro de fibra ${record.fleeceNumber}`)
	await expectFieldValue(
		driver,
		"Fibra: número de vellón",
		record.fleeceNumber,
	)
	await expectFieldValue(driver, "Fibra: peso bruto", record.grossWeight)
	await expectChecked(driver, `Fibra: tipo: ${record.type}`, true)

	if (record.type === "Predescerdado") {
		await expectFieldValue(
			driver,
			"Fibra: peso predescerdado",
			record.dehairedWeight,
		)
		await expectFieldValue(
			driver,
			"Fibra: peso cerda",
			record.bristleWeight,
		)
		await expectChecked(driver, "Fibra: caspa: Si", record.dandruff)
		await expectFieldValue(
			driver,
			"Fibra: nombre del predescerdador",
			record.dehairerName,
		)
		await byLabel(driver, "Firma registrada")
	} else {
		await expectFieldValue(
			driver,
			"Fibra: peso vellón limpio",
			record.cleanWeight,
		)
		await expectFieldValue(driver, "Fibra: peso braga", record.dirtyWeight)
		await expectFieldValue(driver, "Fibra: peso total", record.totalWeight)
	}

	await driver.back()
}

export async function openWorkflowStep(driver, title) {
	await tapLabel(driver, `Abrir ${title}`)
}

export async function expectTotal(driver, total) {
	await byText(driver, `Total ${total}`)
}
