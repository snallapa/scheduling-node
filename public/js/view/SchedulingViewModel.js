ViewModel = (function () {
	var model;

	function init(initModel) {
		model = initModel;
	}

	function getParticipants() {
		return model.getParticipants();
	}

	function getClasses() {
		return model.getClasses();
	}

	function getSchedule() {
		return model.getSchedule();
	}

	return {
		init: init,
		getParticipants: getParticipants,
		getClasses: getClasses,
		getSchedule: getSchedule
	};

}) ();