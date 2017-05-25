var SchedulingView = (function () {
	var tableView;
	var listView;
	var viewModel;
	var emitter;

	function init(initTableView, initListView, initViewModel, initEmitter) {
		tableView = initTableView;
		listView = initListView;
		viewModel = initViewModel;
		emitter = initEmitter;
		listView.init(emitter);
		tableView.init(emitter, listView.getCurrentParticipant(), [], 6, 6);
		$(".alert").hide();
		$(".alert").slideUp();
		listView.addObserver(this);
	}

	function updateListView() {
		listView.update(viewModel.getParticipants());
	}

	function updateAutocomplete() {
		tableView.updateClasses(viewModel.getClasses());
	}

	function updateSchedule() {
		tableView.updateSchedule(viewModel.getSchedule());
	}

	function error(error) {
		alert(error);
	}

	function scheduleChange(forceUpdate, id) {
		if (forceUpdate || listView.getCurrentParticipant().id === id) {
			emitter.getSchedule(id);
		}
	}

	function participantChange(participant) {
		tableView.setCurrentParticipant(participant);
	}

	return {
		init: init,
		updateListView: updateListView,
		updateAutocomplete: updateAutocomplete,
		updateSchedule: updateSchedule,
		scheduleChange: scheduleChange,
		participantChange:participantChange,
		error: error
	};

}) ();