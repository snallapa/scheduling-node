var Controller = (function () {
	var model;
	var view;
	var socket;

	function error(error) {
		view.error(error);
	}

	function newParticipants(participantList) {
		model.clearParticipants();
		participantList.forEach(function (user) {
			model.addParticipant(new Participant(user.name, user._id));
		});
		
		view.updateListView();
	}

	function newClasses(classList) {
		model.clearClasses();
		for (newClass in classList) {
			model.addClass(new ClassModel(newClass.name, newClass.location, newClass.max));
		}
		view.updateAutocomplete();
	}

	function newSchedule(schedule) {
		model.clearSchedule();
		schedule.forEach(function (classEvent) {
			classModel = new ClassModel(
				classEvent.classrosterId.name, 
				classEvent.classrosterId.location,
				classEvent.classrosterId.maxNumber,
				classEvent.classrosterId._id);
			model.addSchedule(new ClassEvent(classEvent.day, 
				classEvent.startTime, 
				classEvent.endTime, 
				classModel, 
				classEvent._id));
		});
		view.updateSchedule();
	}

	function init(initModel, initView) {
		model = initModel;
		view = initView;
	}

	return {
		init: init,
		error: error,
		newParticipants: newParticipants,
		newClasses: newClasses,
		newSchedule: newSchedule
	};

}) ();

$(document).ready( function () {
	ViewModel.init(Model);
	SchedulingView.init(TableView, ListView, ViewModel, Emitter);
	Controller.init(Model, SchedulingView);
	SocketModel.init(Controller, Emitter);
});