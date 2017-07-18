var SchedulingView = (function () {
	var tableView;
	var listView;
	var schedulingHelper;
	var viewModel;
	var emitter;

	function init(initTableView, initListView, initViewModel, initEmitter) {
		$(".alert").hide();
		$(".alert").slideUp();
		tableView = initTableView;
		listView = initListView;
		viewModel = initViewModel;
		emitter = initEmitter;
		SchedulingListViewHelper.init(emitter);
		schedulingHelper = SchedulingListViewHelper;
		listView.init(schedulingHelper);
		tableView.init(emitter, schedulingHelper.getCurrentListItem(), [], 6, 6);
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
		tableView.setCurrentParticipant(participant);
	}

	function setSettings(settings) {
	    console.log("settings set");
	    var times = [];
        var numberOfTimes = settings.startTime.length;
        for (var i = 0; i < numberOfTimes; i++) {
	        times.push(settings.startTime[i] + " - " + settings.endTime[i]);
        }
        tableView.setSettings(settings.days, times, numberOfTimes, settings.days.length);
    }

	return {
		init: init,
		updateListView: updateListView,
		updateAutocomplete: updateAutocomplete,
		updateSchedule: updateSchedule,
		scheduleChange: scheduleChange,
		participantChange:participantChange,
		error: error,
		setSettings: setSettings
	};

}) ();