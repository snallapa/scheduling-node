var ViewModel = (function () {
	var model;

	function init(initModel) {
		model = initModel;
	}

	function getParticipantsInClass() {
		return model.getParticipantsInClass();
	}

	function getClassesForDay() {
		return model.getClassesForDay();
	}

	function getAllParticipants() {
		return model.getAllParticipants();
	}

	return {
		init: init,
		getParticipantsInClass: getParticipantsInClass,
		getClassesForDay: getClassesForDay,
		getAllParticipants: getAllParticipants
	};

}) ();