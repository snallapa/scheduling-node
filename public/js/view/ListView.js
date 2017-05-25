var ListView = (function () {
	var emitter;
	var userlist;
	var currentSpot;
	var LOCAL_STORAGE_STRING = "list_item_place";
	var LOCAL_STORAGE_ID = "list_item_id";
	var listChangeObservers;

	function CurrentSpot (index, participant) {
		this.index = index;
		this.participant = participant;
	}

	function init(initEmitter) {
		emitter = initEmitter;
		listChangeObservers = [];
		getSavedIndex();
		bind();
		setupSearch();
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

	function onItemClick(event) {
		var index = currentSpot.index;
		$(".itemData:eq(" + index + ")").removeClass("active");
		$(".itemData:eq(" + index + ")").removeAttr('id');
		index = $(this).index();
		currentSpot.index = index;
		currentSpot.participant = userlist[index];
		saveLocalData();
		$(".itemData:eq(" + index + ")").addClass("active");
		$(".itemData:eq(" + index + ")").attr("id", "participantChosen");
		listChangeObservers.forEach(notify);
		emitter.getSchedule(currentSpot.participant.id);
	}

	function onEditModalOpened(event) {
		event.stopImmediatePropagation();
		$("#newParticipantName").val(currentSpot.participant.name);
		$('#editModal').modal();
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
			emitter.addParticpant(name);
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
			currentSpot = new CurrentSpot(currentSpot.index - 1, userlist[currentSpot.index -1]);
		} else {
			currentSpot = new CurrentSpot(currentSpot.index + 1, userlist[currentSpot.index + 1]);
		}
		userlist = undefined;
		emitter.getSchedule(currentSpot.participant.id);
	}

	function bind() {
		$("div").on("click",".itemData", onItemClick);
		$("div").on('click', ".editParticipant", onEditModalOpened);
		$('#newParticipantModal').on('shown.bs.modal', function () {
			$('#name').focus();
		});
		$('#editModal').on('shown.bs.modal', function () {
			$('#newParticipantName').focus();
		});
		$(".editParticipantButton").click(onEditConfirmed);

		$(document).keypress(onModalOpened);

		$(".addParticipantButton").click(onNewParticipant);
		
		$(".closeWarning").click(function () {
			$(".alert").slideUp();
		});

		$("div").on('click', ".removeParticipant", function (event) {
			event.stopImmediatePropagation();
			$(".residentWarning").slideDown();
		});

		$(".actuallyRemoveResident").click(onParticipantDeleted);
	}

	function setupSearch() {
		$('#search').hideseek();
	}

	//figure out a smarter way to do this
	function update(newUserlist) {
		if (userlist == undefined && currentSpot == undefined) {
			id = localStorage.getItem(LOCAL_STORAGE_ID);
			currentSpot.participant = new Participant(undefined, id);
			listChangeObservers.forEach(function(observer) {
				notify(observer);
			});
			emitter.getSchedule(id);	
		}
		userlist = newUserlist;
		$(".itemData").remove();
		var indexSet = false;
		for (var i = 0; i < userlist.length; i++) {
			if (i === currentSpot.index || userlist[i].equal(currentSpot.participant)) {
				indexSet = true;
				$(".list-group").append('<div id="participantChosen" class="list-group-item active itemData"></div>');
				$(".itemData:eq(" + i + ")").append('<p class="participantName list-item-inline participantName">' + userlist[i].titleString() + '</p>');
				$(".itemData:eq(" + i + ")").append('<a title="Remove Participant" class="removeParticipant list-item-inline "><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a>');
				$(".itemData:eq(" + i + ")").append('<a title="Edit Participant" href="#" class="editParticipant list-item-inline"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></a>');
				currentSpot.index = i;
				currentSpot.participant = userlist[i];
			}
			else {
				$(".list-group").append('<div class="list-group-item itemData"></div>');
				$(".itemData:eq(" + i + ")").append('<p class="list-item-inline participantName">' + userlist[i].titleString() + '</p>');
				$(".itemData:eq(" + i + ")").append('<a title="Remove Participant" class="removeParticipant list-item-inline"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a>');
				$(".itemData:eq(" + i + ")").append('<a title="Edit Participant" class="editParticipant list-item-inline"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></a>');
			}
		}
		if (!indexSet) {
			currentSpot.index = 0;
			currentSpot.participant = undefined;
			update(userlist);
		}
	}

	function getCurrentParticipant() {
		return currentSpot.participant;
	}

	function addObserver(observer) {
		listChangeObservers.push(observer);
	}

	return {
		init: init,
		update: update,
		getCurrentParticipant: getCurrentParticipant,
		addObserver: addObserver
	};

}) ();

