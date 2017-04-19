var SchedulingView = (function () {
	var tableView;
	var listView;
	var viewModel;

	function init(initTableView, initListView, initViewModel, emitter) {
		tableView = initTableView;
		listView = initListView;
		viewModel = initViewModel;
		listView.init(emitter);
		tableView.init(emitter, listView.getCurrentParticipant(), [], 6, 6);
		$(".alert").hide();
		$(".alert").slideUp();
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

	return {
		init: init,
		updateListView: updateListView,
		updateAutocomplete: updateAutocomplete,
		updateSchedule: updateSchedule,
		error: error
	};

}) ();