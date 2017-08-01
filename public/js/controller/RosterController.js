var Controller = (function () {
	var model;
	var view;

	function error(error) {
		view.error(error);
	}

	function newParticipants(participantList) {
		model.clearParticipants();
		participantList.forEach(function (user) {
			model.addParticipant(new Participant(user.name, user._id));
		});
		view.updateAutocomplete();
	}

	function newParticipantInClass(newParticipants) {
		model.clearParticipantsInClass();
		newParticipants.forEach(function (newParticipant) {
			model.addParticipantInClass(new Participant(newParticipant.participantId.name, 
				newParticipant.participantId._id));
		});
		view.updateSchedule();
	}

	function newClassesForDay(classForDay) {
		model.clearClassesForDay();
		classForDay.forEach(function (classEvent) {
			classModel = new ClassModel(
				classEvent.classrosterId.name, 
				classEvent.classrosterId.location,
				classEvent.classrosterId.maxNumber,
				classEvent.classrosterId._id);
			model.addClassForDay(new ClassEvent(classEvent.day, 
				classEvent.startTime, 
				classEvent.endTime, 
				classModel, 
				undefined,
				classEvent.num));
		});
		view.updateListView();
	}

	function scheduleChange(forceUpdate, id) {
		view.scheduleChange(forceUpdate, id);
	}

	function newClasses(classList) {
	    //no op
	}

	function setSettings() {
        //no op
    }

	function init(initModel, initView) {
		model = initModel;
		view = initView;
	}

	return {
		init: init,
		error: error,
		newParticipants: newParticipants,
		newParticipantInClass: newParticipantInClass,
		newClassesForDay: newClassesForDay,
		scheduleChange: scheduleChange,
		newClasses: newClasses,
		setSettings: setSettings
	};

}) ();