var SchedulingListViewHelper = (function () {
	var listChangeObservers;
	var currentSpot;
	var emitter;
	var LOCAL_STORAGE_STRING = "list_item_place";
	var LOCAL_STORAGE_ID = "list_item_id";
	var userlist;

	function init(initEmitter) {
		emitter = initEmitter;
		listChangeObservers = [];
		getSavedIndex();
		bind();
	}


	function CurrentSpot (index, participant) {
		this.index = index;
		this.participant = participant;
	}

	function bind () {
		$(document).keypress(onModalOpened);
		$('#newParticipantModal').on('shown.bs.modal', function () {
			$('#name').focus();
		});

		$('#editModal').on('shown.bs.modal', function () {
			$('#newParticipantName').focus();
		});
		$(".editParticipantButton").click(onEditConfirmed);
		$(".addParticipantButton").click(onNewParticipant);
		$(".actuallyRemoveParticipant").click(onParticipantDeleted);

	}

	function setupFirstIndex() {
		id = localStorage.getItem(LOCAL_STORAGE_ID);
		currentSpot.participant = new Participant(undefined, id);
		listChangeObservers.forEach(notify);
		emitter.getSchedule(id);	
	}

	function setList(newUserlist) {
		userlist = newUserlist;
	}

	function getSavedIndex() {
		var index = parseInt(localStorage.getItem(LOCAL_STORAGE_STRING));
		if (index === null) {
			index = 0;
		}
		currentSpot = new CurrentSpot(index, undefined);
	}

	function saveLocalData() {
		localStorage.setItem(LOCAL_STORAGE_STRING, currentSpot.index.toString());
		localStorage.setItem(LOCAL_STORAGE_ID, currentSpot.participant.id);
	}

	function notify(observer) {
		observer.participantChange(currentSpot.participant);
	}

	function updateIndex(index) {
		currentSpot.index = index;
		currentSpot.participant = userlist[index]
		if (currentSpot.participant) {
			saveLocalData();
			listChangeObservers.forEach(notify);
			emitter.getSchedule(currentSpot.participant.id);
		}
	}

	function onEditClicked(event) {
		event.stopImmediatePropagation();
		$("#newParticipantName").val(currentSpot.participant.name);
		$('#editModal').modal();
	}

	function onRemoveClicked(event) {
		event.stopImmediatePropagation();
		$(".residentWarning").slideDown();
	}

	function onEditConfirmed() {
		var newName = $("#newParticipantName").val();
		if (newName === "") {
			$(".residentNotEdited").slideDown().delay(3000)
			.slideUp();
		}
		else {
			emitter.editParticipant(currentSpot.participant.name, newName);
			$("#newParticipantName").val("");
			$('#editModal').modal('hide');
			$("#search").val("");
		}
	}

	function onModalOpened (e) {
		if (e.which == 13) {
			e.preventDefault();
			if(($("#newParticipantModal").data('bs.modal') || {}).isShown) {
				$(".addParticipantButton").trigger("click");
			} else if (($("#editModal").data('bs.modal') || {}).isShown) {
				$(".editParticipantButton").trigger("click");	
			}
		}
	}

	function onNewParticipant () {
		var name = $("#name").val();
		if (name === "") {
			$(".participantNotAdded").slideDown().delay(3000)
			.slideUp();
		} else {
			emitter.addParticipant(name);
			$("#name").val("");
			$('#newParticipantModal').modal('hide');
			$("#search").val("");
			userlist = undefined;
		}
	}

	function onParticipantDeleted() {
		$(".alert").slideUp();
		emitter.removeParticipant(currentSpot.participant.name, currentSpot.participant.id);
		if (currentSpot.index == userlist.length - 1) {
			currentSpot = new CurrentSpot(currentSpot.index - 1, userlist[currentSpot.index - 1]);
		} else {
			currentSpot = new CurrentSpot(currentSpot.index + 1, userlist[currentSpot.index + 1]);
		}
		userlist = undefined;
		emitter.getSchedule(currentSpot.participant.id);
	}

	function getCurrentIndex() {
		return currentSpot.index;
	}

	function getCurrentListItem() {
		return currentSpot.participant;
	}

	function addObserver(observer) {
		listChangeObservers.push(observer);
	}

	function getList() {
		return userlist;
	}

	function getRemoveTitle() {
		return "Remove Participant";
	}

	function getEditTitle() {
		return "Edit Participant";
	}

	return {
		init: init,
		setupFirstIndex:setupFirstIndex,
		setList: setList,
		updateIndex: updateIndex,
		onEditClicked: onEditClicked,
		onRemoveClicked: onRemoveClicked,
		addObserver: addObserver,
		getList: getList,
		getCurrentListItem: getCurrentListItem,
		getCurrentIndex: getCurrentIndex,
		getRemoveTitle: getRemoveTitle,
		getEditTitle: getEditTitle
	};

}) ();