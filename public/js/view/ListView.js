var ListView = (function () {
	var helper;
	var options;
	
	function init(initHelper, initOptions) {
		var defaults = {removeOption: true, editOption: true}
		options = $.extend({}, defaults, initOptions || {})
		helper = initHelper;
		bind();
		setupSearch();
	}

	function onItemClick(event) {
		var index = helper.getCurrentIndex();
		$(".itemData:eq(" + index + ")").removeClass("active");
		$(".itemData:eq(" + index + ")").removeAttr('id');
		index = $(this).index();
		helper.updateIndex(index);
		$(".itemData:eq(" + index + ")").addClass("active");
	}

	function bind() {
		$("div").on("click",".itemData", onItemClick);
		$("div").on('click', ".editAction", helper.onEditClicked);
		$("div").on('click', ".removeAction", helper.onRemoveClicked);
		$(".closeWarning").click(function () {
			$(".alert").slideUp();
		});
	}

	function setupSearch() {
		$('#search').hideseek();
	}

	//figure out a smarter way to do this
	function update(userlist) {
		if (helper.getUserList() == undefined && helper.getCurrentListItem() == undefined) {
			helper.setupFirstIndex();
		}
		helper.setList(userlist);
		$(".itemData").remove();
		var indexSet = false;
		for (var i = 0; i < userlist.length; i++) {
			if (i === helper.getCurrentIndex() || userlist[i].equal(helper.getCurrentListItem())) {
				indexSet = true;
				$(".list-group").append('<div class="list-group-item active itemData"></div>');
				$(".itemData:eq(" + i + ")").append('<p class="listHeader list-item-inline">' + userlist[i].titleString() + '</p>');
				if (options.removeOption) {
					$(".itemData:eq(" + i + ")").append('<a title="' + helper.getRemoveTitle() + '" class="removeAction list-item-inline"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a>');
				}
				if (options.editOption) {
					$(".itemData:eq(" + i + ")").append('<a title="' + helper.getEditTitle() + '" class="editAction list-item-inline"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></a>');
				}
				helper.updateIndex(i);
			}
			else {
				$(".list-group").append('<div class="list-group-item itemData"></div>');
				$(".itemData:eq(" + i + ")").append('<p class="list-item-inline listHeader">' + userlist[i].titleString() + '</p>');
				if (options.removeOption) {
					$(".itemData:eq(" + i + ")").append('<a title="' + helper.getRemoveTitle() + '" class="removeAction list-item-inline"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a>');
				}
				if (options.editOption) {
					$(".itemData:eq(" + i + ")").append('<a title="' + helper.getEditTitle() + '" class="editAction list-item-inline"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></a>');
				}
			}
		}
		if (!indexSet) {
			helper.updateIndex(0);
			update(userlist);
		}
	}

	function addObserver(observer) {
		helper.addObserver(observer);
	}

	return {
		init: init,
		update: update,
		addObserver: addObserver
	};

}) ();

