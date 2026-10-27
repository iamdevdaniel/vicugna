const permitId = "permit-1";

function makeCompletePermitData(options = {}) {
	const useDehearing = options.detailType === "dehearing";

	return {
		participants: [
			{
				id: "participant-1",
				permitId,
				name: "Ana",
				lastNames: "Mamani",
				gender: "F",
				identityNumber: "123456",
				signature: '["M20 50 L80 20 L140 50"]',
				notes: "",
			},
		],
		shearingHeader: {
			id: "shearing-header-1",
			permitId,
			site: "Corral",
			latitude: -19.5,
			longitude: -65.75,
			roundupCount: 1,
			eventDate: "15/10/2026",
			startTime: "08:00",
			endTime: "10:00",
			isCompleted: true,
		},
		shearingRecords: [
			{
				id: "shearing-record-1",
				permitId,
				tagNumber: 1,
				sex: "F",
				ageCategory: "Adulto",
				liveWeight: 40,
				fiberLength: 8,
				bodyCondition: "Bueno",
				gestationStatus: "No",
				externalParasites: [],
				mangeSeverity: "Ninguna",
				hasDandruff: false,
				isSheared: true,
				isDead: false,
				observations: "",
			},
		],
		cleaningHeader: {
			id: "cleaning-header-1",
			permitId,
			startDate: "16/10/2026",
			endDate: "17/10/2026",
			site: "Galpón",
			supervisors: "María",
			isCompleted: true,
		},
		cleaningCommonRecords: [
			{
				id: "cleaning-record-1",
				permitId,
				fleeceNumber: "1",
				grossWeight: 2,
			},
		],
		groomingDetails: useDehearing
			? []
			: [
					{
						id: "grooming-detail-1",
						cleaningCommonId: "cleaning-record-1",
						cleanWeight: 1,
						dirtyWeight: 0.5,
						totalWeight: 1.5,
						isCompleted: true,
					},
				],
		dehearingDetails: useDehearing
			? [
					{
						id: "dehearing-detail-1",
						cleaningCommonId: "cleaning-record-1",
						dehairedWeight: 1,
						bristleWeight: 0.5,
						hasDandruff: false,
						dehairerName: "María",
						signature: '["M20 50 L80 20 L140 50"]',
						isCompleted: true,
					},
				]
			: [],
	};
}

module.exports = { makeCompletePermitData, permitId };
