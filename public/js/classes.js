var userclasses;
var index;
$(document).ready( function () {
	$(".alert").hide();
	$(".alert").slideUp();

	socket = io();

	//for any error messages server sends us
	socket.on("errorMessage", function(error){
		alert(error);
	});

	//the class list
	socket.on('classlist', function(classes) {
		userclasses = classes;
		loadClasses(userclasses);
	})

	//show warning when the remove is clicked
	$("div").on('click', ".glyphicon-remove", function (event) {
		index = $('#classes tr').index($(event.target).parent().parent()) - 1;
		event.stopImmediatePropagation();
		$(".classesWarning").slideDown();
	});

	//show modal when the edit class is clicked
	$("div").on('click', ".glyphicon-pencil", function (event) {
		index = $('#classes tr').index($(event.target).parent().parent()) - 1;
		event.stopImmediatePropagation();
		$('#editClassModal').modal();
	});

	//fill the modal with the relevant information
	$('#editClassModal').on('shown.bs.modal', function () {
		$('#editNewName').focus();
		$("#editNewName").val($('#classes tr').eq(index+1).find('td').eq(0).text());
		$("#editLocation").val($('#classes tr').eq(index+1).find('td').eq(1).text());
		$("#editMax").val($('#classes tr').eq(index+1).find('td').eq(2).text());
	});

	//send message to server when we want to save
	$(".editClassButton").click(function () {
		var newName = $("#editNewName").val();
		var newLocation = $("#editLocation").val();
		var newMax = $("#editMax").val();
		if (newName === "") {
			$(".classNotEdited").slideDown().delay(3000)
			.slideUp();
		}
		else {
			var name = $('#classes tr').eq(index+1).find('td').eq(0).text();
			for (var i = 0; i < userclasses.length; i++) {
				if (userclasses[i].nameLower === name.toLowerCase()) {
					index = i;
					break;
				}
			}
			socket.emit('edit class', {id:userclasses[index]._id, newName:newName, newLocation: newLocation, newMax: newMax});
			$("#editNewName").val("");
			$("#editLocation").val("");
			$("#editMax").val("");
			$('#editClassModal').modal('hide');
			$("#search").val("");
		}
	});

	//add focus on the first field
	$('#addClassModal').on('shown.bs.modal', function () {
		$('#newName').focus();
	});

	//account for enter button
	$(document).keypress(function (e) {
		if (e.which == 13) {
			e.preventDefault();
			if(($("#addClassModal").data('bs.modal') || {}).isShown) {
				$(".addClassButton").trigger("click");
			} else if (($("#editClassModal").data('bs.modal') || {}).isShown) {
				$(".editClassButton").trigger("click");	
			}
		}
	});

	//create a new class
	$(".addClassButton").click(function () {
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
			$('#addClassModal').modal('hide');
			$("#search").val("");
		}
	});

	//remove the class
	$(".actuallyRemoveClass").click( function () {
		$(".alert").slideUp();
		socket.emit('remove class', {id: userclasses[index]._id});
		$('#search').val("");
	});

	//slide up the warnings
	$(".closeWarning").click(function () {
		$(".alert").slideUp();
	});

	//search html way
	$('#search').hideseek();
});

//add the classes
function loadClasses(classes) {
	$("#classes").find("tr:gt(0)").remove();
	for (var i = 0; i < classes.length; i++) {
		if (!classes[i].maxNumber) {
			classes[i].maxNumber = "";
		}
		$('#classes> tbody:last-child').append('<tr><td>' + classes[i].name+ '</td><td>' + classes[i].location + '</td><td>' + classes[i].maxNumber + '</td><td><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></tr>');
	}
	
}
