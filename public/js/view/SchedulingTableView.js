var SchedulingTableView = (function () {
	var emitter;
	var currentParticipant;
	var classList;
	var classEntered;
	var savedSchedule;
	var MAX_COLUMNS;
	var MAX_ROWS;

	function init(initEmitter, initCurrentParticipant, initClassList, maxCol, maxRow) {
		emitter = initEmitter;
		currentParticipant = initCurrentParticipant;
		classList = initClassList;
		MAX_COLUMNS = maxCol;
		MAX_ROWS = maxRow;
		savedSchedule = {};
		bind();
		setupTable();
	}

	function clearSchedule() {
		$(".alert").slideUp();
		emitter.clearSchedule(currentParticipant.id);
	}

	function exportSchedule() {
		var tableElement = $("#schedule").clone();
		tableElement.find("tfoot").remove();
		var table = tableElement.html();
		var participantName = currentParticipant.name;
		var exportWindow = window.open("export","Export", '');
		exportWindow.onload = function() {
			exportWindow.document.getElementById('header').innerHTML = participantName + "'s Schedule";
			exportWindow.document.getElementById('schedule').innerHTML = table;
		};
	}

	function addNewClass() {
		var name = $("#newName").val().trim();
		var location = $("#location").val().trim();
		var max = $("#max").val().trim();
		if (name === "" || (max != '' && isNaN(parseInt(max)))) {
			$(".classNotAdded").slideDown().delay(3000)
			.slideUp();
		} else {
			max = parseInt(max);
			emitter.newClass(name, location, max);
			$("#name").val("");
			$("#location").val("");
			$("#max").val("");
			$('#addClass').modal('hide');
			$("#search").val("");
			$('.addClassWarning').slideUp();
		}
	}

	function bind() {
		$(".actuallyClearSchedule").click(clearSchedule);

		$(".clearSchedule").click(function () {
			$(".clearWarning").slideDown();
		});

		$(".exportSchedule").click(exportSchedule);

		$('#addClass').on('shown.bs.modal', function () {
			$('#newName').focus();
		});

		$('.clearModalButton').click(function() {
			$('.addClassWarning').slideUp();
		});

		$(".addClassButton").click();
	}

	function validate (evt, newValue) {
		var cell = $(this);
		var col = cell.parent().children().index(cell);
		var row = cell.parent().parent().children().index(cell.parent());
		if (col === 0) {
			classEntered = undefined;
			return false;
		} 
	}

	function onChange(evt, newValue) {
		saveSchedule($(this), (newValue.trim() === ""));
	}

	function setupTable() {
		$('#schedule').editableTableWidget({
			editor: $('<textarea>')
		});

		$('#schedule').editableTableWidget({
			cloneProperties: ['background', 'border', 'outline']
		});

		$('table td').on('validate', validate);

		$('table td').on('change', onChange);
	}

	function onItemSelected(event, ui) {
		classEntered = ui.item.actualClass;
	}

	function setupAutocomplete() {
		$( "textarea" ).not("#search").autocomplete({
			source: classList.map(function(roster) {
				value = roster.name + "\n" + roster.location;
				label = value + ": " + (!roster.max ? "No Max" : roster.max);
				return {value: value, label: label, actualClass:roster};
			})
		});
		$( "textarea" ).not("#search").on("autocompleteselect", onItemSelected);
		$( "textarea" ).not("#search").on("autocompletefocus", onItemSelected);
	}

	function updateClasses(newClassList) {
		classList = newClassList;
		setupAutocomplete();
	}

	function saveSchedule(cell, deleteClass) {
		var col = cell.parent().children().index(cell);
		var row = cell.parent().parent().children().index(cell.parent());
		var participantId = currentParticipant.id
		var tableRows = $("#schedule").find('tbody').find('tr');
		var time = $(tableRows[row]).find('td:eq(0)').html();
		time = time.split("-");
		time[0] = time[0].trim();
		time[1] = time[1].trim();
		if (classEntered === undefined && (!deleteClass)) {
			$('.addClassWarning').slideDown();
			return;
		}
		if (deleteClass) {
			var deleteClass = savedSchedule[row + "" + col];
			if (deleteClass) {
				classEvent = {day: col - 1, startTime: time[0], endTime:time[1], classrosterid:deleteClass.id};
				emitter.deleteClass(participantId, classEvent);
			}
		} else {
			classEvent = {day: col - 1, startTime: time[0], endTime:time[1],classrosterid:classEntered.id};
			emitter.saveClass(participantId, classEvent);
		}
		classEntered = undefined;
	}

	function getNumberFromDay(day) {
		if (day.toLowerCase() === "monday") {
			return 0;
		} else if (day.toLowerCase() === "tuesday") {
			return 1;
		} else if (day.toLowerCase() === "wednesday") {
			return 2;
		} else if (day.toLowerCase() === "thursday") {
			return 3;
		} else if (day.toLowerCase() === "friday") {
			return 4;
		}
	}

	function updateSchedule(schedule) {
		var tableRows = $("#schedule").find('tbody').find('tr');
		$('.clearable').html("");
		for (var i = 1; i < MAX_COLUMNS;i++) {
			var day = getNumberFromDay($('th:eq(' + i + ')').html().toLowerCase());
			for(var j = 0; j < MAX_ROWS;j++) {
				var time = $(tableRows[j]).find('td:eq(0)').html();
				time = time.split("-");
				time[0] = time[0].trim();
				time[1] = time[1].trim();
				for(var k = 0; k < schedule.length; k++) {
					var event = schedule[k];
					if(event.startTime === time[0] && event.day === day) {
						$(tableRows[j]).find('td:eq(' + i + ')').html(event.classModel.showableString());
						savedSchedule[j + "" + i] = event;
					}
				}
			}
		}
	}

	function setCurrentParticipant(participant) {
		currentParticipant = participant;
	}

	return {
		init: init,
		updateSchedule: updateSchedule,
		updateClasses: updateClasses,
		setCurrentParticipant: setCurrentParticipant
	};

}) ();