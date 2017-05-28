var RosterView = (function () {
	var tableView;
	var listView;
	var schedulingHelper;
	var viewModel;
	var emitter;
	var currentClass;

	function init(initTableView, initListView, initViewModel, initEmitter) {
		tableView = initTableView;
		listView = initListView;
		viewModel = initViewModel;
		emitter = initEmitter;
		RosterListViewHelper.init(emitter);
		schedulingHelper = RosterListViewHelper;
		listView.init(schedulingHelper, {editOption: false, subtitle: true});
		tableView.init(emitter);
		$(".alert").hide();
		$(".alert").slideUp();
		listView.addObserver(this);
	}

	function updateListView() {
		listView.update(viewModel.getClassesForDay());
	}

	function updateAutocomplete() {
		tableView.updateAllParticipants(viewModel.getAllParticipants());
	}

	function updateSchedule() {
		tableView.updateParticipants(viewModel.getParticipantsInClass());
	}

	function error(error) {
		alert(error);
	}

	function scheduleChange(forceUpdate, id) {
		emitter.getClassesForDay(currentClass.day)
	}

	function classChange(newCurrentClass) {
		currentClass = newCurrentClass;
		tableView.setCurrentClass(newCurrentClass);
	}

	return {
		init: init,
		updateListView: updateListView,
		updateAutocomplete: updateAutocomplete,
		updateSchedule: updateSchedule,
		scheduleChange: scheduleChange,
		classChange:classChange,
		error: error
	};

}) ();