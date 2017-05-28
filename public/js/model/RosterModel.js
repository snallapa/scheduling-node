var Model = (function () {
	var participantInClass = [];
	var participantList = [];
	var currentClassesForDay = [];

	function addParticipantInClass(newParticipant) {
		participantInClass.push(newParticipant);
	}

	function clearParticipantsInClass () {
		participantInClass = [];
	}

	function addClassForDay(newClass) {
		currentClassesForDay.push(newClass);
	}

	function clearClassesForDay() {
		currentClassesForDay = [];
	}

	function getParticipantsInClass() {
		return participantInClass;
	}

	function getClassesForDay() {
		return currentClassesForDay;
	}

	function clearParticipants() {
		participantList = [];
	}

	function addParticipant(newParticipant) {
		participantList.push(newParticipant);
	}

	function getAllParticipants() {
		return participantList;
	}

	return {
		addParticipantInClass: addParticipantInClass,
		clearParticipantsInClass: clearParticipantsInClass,
		addClassForDay: addClassForDay,
		clearClassesForDay: clearClassesForDay,
		getParticipantsInClass: getParticipantsInClass,
		getClassesForDay: getClassesForDay,
		addParticipant: addParticipant,
		getAllParticipants: getAllParticipants,
		clearParticipants: clearParticipants
	};

}) ();