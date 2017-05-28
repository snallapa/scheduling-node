$(document).ready( function () {
	ViewModel.init(Model);
	SocketModel.init(Controller, Emitter);
	RosterView.init(TableView, ListView, ViewModel, Emitter);
	Controller.init(Model, RosterView);
});