var userclasses;
var index;
$(document).ready( function () {
	$(".alert").hide();
	$(".alert").slideUp();

	socket = io();

	socket.on("errorMessage", function(error){
		alert(error);
	});

	socket.on('classlist', function(classes) {
		userclasses = classes;
		loadClasses(userclasses);
	})

	$("div").on('click', ".glyphicon-remove", function (event) {
		index = $('#classes tr').index($(event.target).parent().parent()) - 1;
		event.stopImmediatePropagation();
		$(".classesWarning").slideDown();
	});
	$("div").on('click', ".glyphicon-pencil", function (event) {
		index = $('#classes tr').index($(event.target).parent().parent()) - 1;
		event.stopImmediatePropagation();
		$('#editModal').modal();
	});

	$('#editModal').on('shown.bs.modal', function () {
		$('#newName').focus();
		$("#newName").val($('#classes tr').eq(index+1).find('td').eq(0).text());
	});

	$(".editClassButton").click(function () {
		var newName = $("#newName").val();
		if (newName === "") {
			$(".residentNotEdited").slideDown().delay(3000)
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
			socket.emit('edit class', {id:userclasses[index]._id, newName:newName});
			$("#newName").val("");
			$('#editModal').modal('hide');
			$("#search").val("");
		}
	});

	$('#myModal').on('shown.bs.modal', function () {
		$('#name').focus();
	});

	$(document).keypress(function (e) {
		if (e.which == 13) {
			e.preventDefault();
			if(($("#myModal").data('bs.modal') || {}).isShown) {
				$(".userButton").trigger("click");
			} else if (($("#editModal").data('bs.modal') || {}).isShown) {
				$(".editClassButton").trigger("click");	
			}
		}
	});

	$(".userButton").click(function () {
		var name = $("#name").val();
		if (name === "") {
			$(".participantNotAdded").slideDown().delay(3000)
			.slideUp();
		} else {
			socket.emit('new class', {name: name});
			$("#name").val("");
			$('#myModal').modal('hide');
			$("#search").val("");
		}
	});

	$(".actuallyRemoveClass").click( function () {
		$(".alert").slideUp();
		socket.emit('remove class', {id: userclasses[index]._id});
	});

	$(".closeWarning").click(function () {
		$(".alert").slideUp();
	});
	$('#search').hideseek();
});

function loadClasses(classes) {
	$("#classes").find("tr:gt(0)").remove();
	for (var i = 0; i < classes.length; i++) {
		$('#classes> tbody:last-child').append('<tr><td>' + classes[i].name+ '</td><td><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></tr>');
	}
	
}
