/// <reference path="../../typings/jquery/jquery.d.ts"/>

var rosterslist;
var dayNames = ["monday", "tuesday", "wednesday", "thursday", "friday"];
var indexOfList = 0;
var LOCAL_STORAGE_STRING = "list_item_place";
var LOCAL_STORAGE_DATE = "day";
var currentday;
var currentdayClasses = [];
$(document).ready( function () {
	$(".alert").hide();
	$(".alert").slideUp();

	socket = io();

	socket.on("errorMessage", function(error){
		alert(error);
	});

	socket.on('rosterlist', function(rosters) {
		rosterslist = rosters;
		updateRosterList(rosters);
		$("#classChosen").trigger("click");
	});


	socket.on('rosterparticipants', function(rostersclasses) {
		fillRoster(rostersclasses);
	});

	var indexOfList = parseInt(localStorage.getItem(LOCAL_STORAGE_STRING));
	var currentday = parseInt(localStorage.getItem(LOCAL_STORAGE_DATE));

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

	$('#myModal').on('shown.bs.modal', function () {
		$('#name').focus();
	});

	$(".tabs a").click(function (event) {
		event.preventDefault();
		$(this).tab('show');
		currentday = dayNames.indexOf($(event.target).text().toLowerCase());
		socket.emit('get roster', currentday);
		indexOfList = 0;
	});

	$(".tabs a").eq(currentday).trigger("click");

	$(window).unload(function () {
		localStorage.setItem(LOCAL_STORAGE_STRING, indexOfList.toString());
		localStorage.setItem(LOCAL_STORAGE_DATE, currentday.toString());
		return "Bye now!";
	});

	$('#search').hideseek();

	$(".userButton").click(function () {
		var name = $("#name").val();
		if (name === "") {
			$(".participantNotAdded").slideDown().delay(3000)
			.slideUp();
		} else {
			socket.emit('new class', {name: name});
			$("#name").val("");
			$('#myModal').modal('hide');
		}
	});

	$("div").on("click",".itemData", function (event) {
		$("tbody").html("");
		$(".itemData:eq(" + indexOfList + ")").removeClass("active");
		$(".itemData:eq(" + indexOfList + ")").removeAttr('id');
		indexOfList = $(this).index();
		$(".itemData:eq(" + indexOfList + ")").addClass("active");
		$(".itemData:eq(" + indexOfList + ")").attr("id", "classChosen");
		socket.emit('get rosterparticipants', rosterslist[indexOfList]);
	});
});

function updateRosterList(rosters) {
	
	var currentClassName = $("#classChosen > .className").html();
	var currentTime= $("#classChosen > .classTime");

	if (indexOfList > rosters.length) {
		indexOfList = 0;
	}
	if (currentClassName) {
		currentTime = currentTime.html().split('-');
		currentTime[0].trim();
		currentTime[1].trim();
		indexOfList = -1;
	}
	$(".itemData").remove();
	for (var i = 0; i < rosters.length; i++) {
		var currentClass = rosters[i];
		if (i === indexOfList || (currentClassName === currentClass.classrosterId.name && currentTime[0] === currentClass.startTime && currentTime[1] === currentClass.endTime)) {
			$(".list-group").append('<div id="classChosen" class="list-group-item active itemData"></div>');
			$(".itemData:eq(" + i + ")").append('<p class="className list-group-item-heading">' + currentClass.classrosterId.name + '</p>');
			$(".itemData:eq(" + i + ")").append('<p class="classTime list-group-item-text">' + currentClass.startTime + ' - ' + currentClass.endTime + '</p>');
			$(".itemData:eq(" + i + ")").append('<a title="Remove Class" class="removeClass list-item-inline "><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a>');
			indexOfList = i;
		}
		else {
			$(".list-group").append('<div class="list-group-item itemData"></div>');
			$(".itemData:eq(" + i + ")").append('<p class="list-item-inline className">' + currentClass.classrosterId.name + '</p>');
			$(".itemData:eq(" + i + ")").append('<p class="classTime list-item-inline">' + currentClass.startTime + ' - ' + currentClass.endTime + '</p>');
			$(".itemData:eq(" + i + ")").append('<a title="Remove Class" class="removeClass list-item-inline"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a>');
		}
	}
	if (indexOfList == -1) {
		indexOfList = 0;
		updateRosterList(rosterslist);
	}
}

function fillRoster(rosters) {
	$("tbody").html("");
	var newRow = 0;
	for (var i = 0; i < rosters.length; i++) {
		$("tbody").append("<tr></tr>");
		$("tbody tr").last().append('<td class="names">' + rosters[i].participantId.name + '</td><td class="clearable"></td>');
		if (i === rosters.length - 1) {
			break;
		}
		i++;
		$("tbody tr").last().append('<td class="names">' + rosters[i].participantId.name + '</td><td class="clearable"></td>');
	}
}

