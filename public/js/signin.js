$(document).ready(function () {
	$(".signinButton").click(
		function () {
			var username = $(".usernameForm").val();
			var password = $(".passwordForm").val();
			$("#signinform").submit();
			
		});
	$(document).keypress(function (e) {
		if (e.which == 13) {
			if(isScrolledIntoView(".signinButton", "visible")) {
				$(".signinButton").trigger("click");
			}
		}
	});
});

function isScrolledIntoView(elem)
{
    var $elem = $(elem);
    var $window = $(window);

    var docViewTop = $window.scrollTop();
    var docViewBottom = docViewTop + $window.height();

    var elemTop = $elem.offset().top;
    var elemBottom = elemTop + $elem.height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}