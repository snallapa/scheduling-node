var SchedulingView = (function () {
	var tableView;
	var listView;
	var schedulingHelper;
	var viewModel;
	var emitter;

	function init(initTableView, initListView, initViewModel, initEmitter) {
		tableView = initTableView;
		listView = initListView;
		viewModel = initViewModel;
		emitter = initEmitter;
		SchedulingListViewHelper.init(emitter);
		schedulingHelper = SchedulingListViewHelper;
		listView.init(schedulingHelper);
		tableView.init(emitter, schedulingHelper.getCurrentListItem(), [], 6, 6);
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
		tableView.error();
	}

	function scheduleChange(forceUpdate, id) {
		var currentParticipant = schedulingHelper.getCurrentListItem();
		if (forceUpdate || (currentParticipant && currentParticipant.id === id)) {
			emitter.getSchedule(id);
		}
	}

	function participantChange(participant) {
		currentParticipant = participant;
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