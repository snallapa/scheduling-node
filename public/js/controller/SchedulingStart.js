$(document).ready( function () {
	ViewModel.init(Model);
	SchedulingView.init(SchedulingTableView, ListView, ViewModel, Emitter);
	Controller.init(Model, SchedulingView);
	SocketModel.init(Controller, Emitter);
});