var ListView = (function () {
	var helper;
	var options;
	
	function init(initHelper, initOptions) {
		var defaults = {removeOption: true, editOption: true, subtitle:false}
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
		if (options.editOption) {
			$("div").on('click', ".editAction", helper.onEditClicked);
		}
		if (options.removeOption) {
			$("div").on('click', ".removeAction", helper.onRemoveClicked);
		}
		$(".closeWarning").click(function () {
			$(".alert").slideUp();
		});
	}

	function setupSearch() {
		$('#search').hideseek();
	}

	//figure out a smarter way to do this
	function update(list) {
		if (helper.getList() == undefined && helper.getCurrentListItem() == undefined) {
			helper.setupFirstIndex();
		}
		helper.setList(list);
		$(".itemData").remove();
		var indexSet = false;
		for (var i = 0; i < list.length; i++) {
			if (i === helper.getCurrentIndex() || list[i].equal(helper.getCurrentListItem())) {
				indexSet = true;
				$(".list-group").append('<div class="list-group-item active itemData"></div>');
				if (options.subtitle) {
					appendSubtitledItem(list[i].titleString(), list[i].subtitleString(), i);
				} else {
					appendHeaderItem(list[i].titleString(), i);
				}
				helper.updateIndex(i);
			}
			else {
				$(".list-group").append('<div class="list-group-item itemData"></div>');
				if (options.subtitle) {
					appendSubtitledItem(list[i].titleString(), list[i].subtitleString(), i);
				} else {
					appendHeaderItem(list[i].titleString(), i);
				}
			}
		}
		if (!indexSet) {
			helper.updateIndex(0);
			update(list);
		}
	}

	function appendHeaderItem(header, i) {
		$(".itemData:eq(" + i + ")").append('<p class="listHeader list-item-inline">' + header + '</p>');
		addOptions(i);
	}

	function appendSubtitledItem(header, subtitle, i) {
		$(".itemData").last().append('<p class="listHeader list-group-item-heading">' + header+ '</p>');
		$(".itemData").last().append('<p class="listSubtitle list-group-item-text">' + subtitle + '</p>');
		addOptions(i);
	}

	function addOptions(i) {
		if (options.removeOption) {
			$(".itemData:eq(" + i + ")").append('<a title="' + helper.getRemoveTitle() + '" class="removeAction list-item-inline"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a>');
		}
		if (options.editOption) {
			$(".itemData:eq(" + i + ")").append('<a title="' + helper.getEditTitle() + '" class="editAction list-item-inline"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></a>');
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

