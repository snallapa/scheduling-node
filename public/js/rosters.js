/// <reference path="../../typings/jquery/jquery.d.ts"/>

var rosterslist;
var userlist = [];
var dayNames = ["monday", "tuesday", "wednesday", "thursday", "friday"];
var indexOfList;
var LOCAL_STORAGE_STRING = "list_item_place";
var LOCAL_STORAGE_DATE = "day";
var currentday;
var nameToDelete;
var participantNameSaving;

$(document).ready( function () {
	$(".alert").hide();
	$(".alert").slideUp();

	socket = io();

	//socket messages for any errors from server
	socket.on("errorMessage", function(error){
		alert(error);
	});

	//getting roster lists from server
	socket.on('rosterlist', function(rosters) {
		rosterslist = rosters;
		updateRosterList(rosters);
		$("#classChosen").trigger("click");
	});

	//getting participants from roster
	socket.on('rosterparticipants', function(rostersclasses) {
		fillRoster(rostersclasses);
	});

	//if another user changed the current users schedule
	socket.on('schedule change', function(participantId) {
		socket.emit('get roster', currentday);
	});

	//getting participants for autocomplete
	socket.on("userlist", function(serverUserlist){
		userlist = serverUserlist;
	});

	indexOfList = parseInt(localStorage.getItem(LOCAL_STORAGE_STRING));
	currentday = parseInt(localStorage.getItem(LOCAL_STORAGE_DATE));

	//set the day to either today or last day the user was on
	var actualDay = new Date().getDay() % 5;
	if (currentday !== actualDay) {
		indexOfList = 0;
	}
	if (currentday === null) {
		currentday = actualDay;
	}

	if (indexOfList === null) {
		indexOfList = 0;
	}

	//enter submits modal forms
	$(document).keypress(function (e) {
		if (e.which == 13) {
			console.log('here');
			e.preventDefault();
			if(($("#myModal").data('bs.modal') || {}).isShown) {
				$(".classButton").trigger("click");
			} else if (($("#locationModal").data('bs.modal') || {}).isShown) {
				$(".locationButton").trigger("click");	
			}
		}
	});

	//focus on the right fields
	$('#myModal').on('shown.bs.modal', function () {
		$('#name').focus();
	});

	$('#locationModal').on('shown.bs.modal', function () {
		$('#location').focus();
		$("#location").val(rosterslist[indexOfList].location);
		$("#max").val(rosterslist[indexOfList].max);
	});

	//when right tabs are clicked change the day correctly
	$(".tabs a").click(function (event) {
		event.preventDefault();
		$("tbody").html("");
		$(".classTitle").html("");
		$(this).tab('show');
		currentday = dayNames.indexOf($(event.target).text().toLowerCase());
		socket.emit('get roster', currentday);
		indexOfList = 0;
	});

	//start off clicking current day
	$(".tabs a").eq(currentday).trigger("click");

	//when closing save spot in lists
	$(window).unload(function () {
		localStorage.setItem(LOCAL_STORAGE_STRING, indexOfList.toString());
		localStorage.setItem(LOCAL_STORAGE_DATE, currentday.toString());
		return "Bye now!";
	});

	//initialize html search
	$('#search').hideseek();

	//adding a class 
	$(".classButton").click(function () {
		var name = $("#name").val().trim();
		var location = $("#location").val().trim();
		var max = $("#max").val().trim();
		if (name === "" || (max != '' && isNaN(parseInt(max)))) {
			$(".classNotAdded").slideDown().delay(3000)
			.slideUp();
		} else {
			max = parseInt(max);
			socket.emit('new class', {name: name, location : location, max : max});
			$("#name").val("");
			$("#location").val("");
			$("#max").val("");
			$('#myModal').modal('hide');
			$("#search").val("");
			$('.addClassWarning').slideUp();
		}
	});

	//Editing Location
	$(".locationButton").click(function () {
		var location = $("#location").val().trim();
		var max = $("#max").val().trim();
		if (location.trim() === "" || (isNaN(max) && max !== "")) {
			$(".locationNotAdded").slideDown().delay(3000)
			.slideUp();
		} else {
			var className = rosterslist[indexOfList].classrosterId.name;
			var time = [];
			time[0] = rosterslist[indexOfList].startTime;
			time[1] = rosterslist[indexOfList].endTime;
			var id = rosterslist[indexOfList]._id.classrosterId;
			max = parseInt(max);
			socket.emit('edit location', {max: max, location: location, classrosterid: id, startTime: time[0], endTime: time[1], day: currentday});
			$("#location").val("");
			$("#max").val("");
			$('#locationModal').modal('hide');
		}
	});

	//Add Participant if user puts in one not created
	$(".addParticipant").click(function() {
		socket.emit('new participant', {name: participantNameSaving});
		$('.addParticipantWarning').slideUp();
	});

	//close button on all warnings/alerts
	$(".closeWarning").click(function () {
		$(".alert").slideUp();
	});

	//binding on click function for when a roster is clicked in the left side
	$("div").on("click",".itemData", function (event) {
		$("tbody").html("");
		$(".itemData:eq(" + indexOfList + ")").removeClass("active");
		$(".itemData:eq(" + indexOfList + ")").removeAttr('id');
		indexOfList = $(this).index();
		$(".itemData:eq(" + indexOfList + ")").addClass("active");
		$(".itemData:eq(" + indexOfList + ")").attr("id", "classChosen");
		if (!rosterslist[indexOfList].classrosterId.maxNumber) {
			rosterslist[indexOfList].classrosterId.maxNumber = "No"
		}
		$(".classTitle").html(rosterslist[indexOfList].classrosterId.name + " - " + rosterslist[indexOfList].classrosterId.location + " - " + dayNames[currentday].substring(0,1).toUpperCase() + dayNames[currentday].substring(1) + " " + rosterslist[indexOfList].startTime + "-" + rosterslist[indexOfList].endTime + " : " + rosterslist[indexOfList].classrosterId.maxNumber + " max");
		socket.emit('get rosterparticipants', rosterslist[indexOfList]);
	});

	//adding a row to the roster remember 4 cells not 2
	$(".addRow").click(function () {
		$("tbody").append("<tr><td class = 'names'><td class ='names'></td></tr>");
		makeTableEditable();
	});

	//export functionality
	$(".exportSchedule").click(function () {
		var tableElement = $("#rosters").clone();
		tableElement.find("tfoot").remove();
		var table = tableElement.html();
		var className = $(".classTitle").html();
		var exportWindow = window.open("export","Export", '');
		exportWindow.onload = function() {
			exportWindow.document.getElementById('header').innerHTML = className;
			exportWindow.document.getElementById('schedule').innerHTML = table;
		};
	});

});

//create roster list adding element by element
function updateRosterList(rosters) {
	
	var currentClassName = $("#classChosen > .className").html();
	var currentTime= $("#classChosen > .classTime");

	// could happen when switching days
	if (indexOfList > rosters.length) {
		indexOfList = 0;
	}
	if (currentClassName) {
		currentTime = currentTime.html().split('-');
		currentTime[0] = currentTime[0].trim();
		currentTime[1] = currentTime[1].trim();
		indexOfList = -1;
	}
	$(".itemData").remove();
	for (var i = 0; i < rosters.length; i++) {
		var currentClass = rosters[i];
		//null check as class could be empty or deleted
		if (!currentClass.classrosterId) {
			rosterslist.splice(i, 1);
			i--;
			continue;
		}
		if (i === indexOfList || (currentClassName === currentClass.classrosterId.name && currentTime[0] === currentClass.startTime && currentTime[1] === currentClass.endTime)) {
			$(".list-group").append('<div id="classChosen" class="list-group-item active itemData"></div>');
			$(".itemData").last().append('<p class="className list-group-item-heading">' + currentClass.classrosterId.name + '</p>');
			$(".itemData").last().append('<p class="classTime list-group-item-text">' + currentClass.startTime + ' - ' + currentClass.endTime + '</p>');
			$(".itemData").last().append('<a title="Remove Class" class="removeClass list-item-inline "><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a>');
			indexOfList = i;
		}
		else {
			$(".list-group").append('<div class="list-group-item itemData"></div>');
			$(".itemData").last().append('<p class="list-item-inline className">' + currentClass.classrosterId.name + '</p>');
			$(".itemData").last().append('<p class="classTime list-item-inline">' + currentClass.startTime + ' - ' + currentClass.endTime + '</p>');
			$(".itemData").last().append('<a title="Remove Class" class="removeClass list-item-inline"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a>');
		}
	}
	if (indexOfList == -1) {
		indexOfList = 0;
		updateRosterList(rosterslist);
	}
}

//add a row for every participant
function fillRoster(rosters) {
	$("tbody").html("");
	var newRow = 0;
	for (var i = 0; i < rosters.length; i++) {
		$("tbody").append("<tr></tr>");
		//we add two cells because the headers actually have 4 instead of expected 2 to find right length
		//seems shady probably a css way of doing 2 but this works easily and makes the footer easier
		$("tbody tr").last().append('<td class="names">' + rosters[i].participantId.name + '</td>');
		if (i === rosters.length - 1) {
			break;
		}
		i++;
		$("tbody tr").last().append('<td class="names">' + rosters[i].participantId.name + '</td>');
	}
	//to make that last cell editable if there are odd cells
	if (rosters.length%2 == 1) {
		$("tbody tr").last().append('<td class="names"></td>');

	}
	makeTableEditable();
}

function makeTableEditable() {
	//needs to be added here because dynamic rows dont work apparently??
	$('#rosters').editableTableWidget({
		editor: $('<textarea>')
	});

	$('#rosters').editableTableWidget({
		cloneProperties: ['background', 'border', 'outline']
	});
	$( "textarea" ).not("#search").autocomplete({
		source: userlist.map(function(user){
			return user.name;
		})
	});

	//validating name just no long names 
	$('table td').on('validate', function (evt, newValue) {
		var cell = $(this);
		var column = cell.index();
		if (newValue.trim() === "") {
			nameToDelete = cell.html(); 
		}
		else {
			return newValue.trim().length < 65;
		}
	});

	//when it actually gets entered save the roster
	$('table td').on('change', function (evt, newValue) {
		savedRosters($(this));
	});
}

function savedRosters(cell) {
	var time = [];
	var className = rosterslist[indexOfList].classrosterId.name;
	time[0] = rosterslist[indexOfList].startTime;
	time[1] = rosterslist[indexOfList].endTime;
	var participant = cell.html();
	var participantid;

	//if name is empty then we want to delete a person from a class
	if (participant.trim() === "") {
		for (var i = 0; i < userlist.length; i++) {
			if (userlist[i].nameLower === nameToDelete.toLowerCase()) {
				participantid = userlist[i]._id;
				break;
			}
		}
		classEvent = {day: currentday, startTime: time[0], endTime:time[1],classrosterid:rosterslist[indexOfList]._id.classrosterId};
		socket.emit('delete roster', {participantid: participantid, classEvent: classEvent});

	} else {
		for (var i = 0; i < userlist.length; i++) {
			if (userlist[i].nameLower === participant.toLowerCase()) {
				participantid = userlist[i]._id;
				break;
			}
		}
		if (participantid == null) {
			$('.addParticipantWarning').slideDown();
			participantNameSaving = participant; 
			return;
		}
		classEvent = {day: currentday, startTime: time[0], endTime:time[1],classrosterid:rosterslist[indexOfList]._id.classrosterId};
		socket.emit('save roster', {participantid: participantid, classEvent: classEvent});
	}
	
}

