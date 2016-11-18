var kringleModel = function(params){
	var self = this;
	self.user = ko.observable(params.user || "");
	self.kringle = ko.observable(params.kringle || "");
	self.date = ko.observable(params.date || "");
	self.name = ko.observable(params.name || "");
	self.userToGive = ko.observable(params.userToGive);
	self.userToGivePicture = ko.observable(params.userToGivePicture);
	self.showUserToGive = ko.observable(false);
	self.yourWishList = ko.observable(params.yourWishList);
	self.partnerWishList = ko.observable(params.partnerWishList);

	self.hide = function () {
		self.showUserToGive(false);
	}

	self.show = function () {
		self.showUserToGive(true);
	}

	self.picture = ko.computed(function () {
		var image = self.showUserToGive() ? self.userToGivePicture() : "placeholder.png";
		return "images/" + image;
	});

	self.refreshWishList = function () {
		var getWishlist = kringlesApi.getWishlist(self.kringle());
		return getWishlist.then(function (response) {
			self.yourWishList(response.wishlist);
		});
	}
}

var kringlesApi = (function(){
	var self = this;
	self.getKringles = function(){

		return $.ajax({
			type: "GET",
			url: "/api/kringles"
		});

	};

	self.postKringle = function (data) {
		return $.ajax({
			type: "POST",
			url: "/api/kringles",
			data: data
		});
	};

	self.getPossibleUsers = function (data) {
		return $.ajax({
			type: "POST",
			url: "/api/possibleUsers",
			data: data
		});
	};

	self.logout = function () {
		return $.ajax({
			type: "GET",
			url: "/api/logout"
		});
	};

	self.getWishlist = function (kringle) {
		return $.ajax({
			type: "GET",
			url: "/api/wishlist/" + kringle
		});
	};

	self.updateWishList = function (kringle, wishlist) {
		return $.ajax({
			type: "PUT",
			url: "/api/wishlist/" + kringle,
			data: {
				wishlist: wishlist
			}
		});
	};

	self.getCurrentUser = function () {
		return $.ajax({
			type: "GET",
			url: "/api/user"
		});
	}

	return self;
})();

function KringlesViewModel(){
	var self = this;

	self.kringles = ko.observableArray();
	self.isSpinning = ko.observable(false);
	self.possibleUsers = ko.observableArray();
	self.pickedUser = ko.observable({
		picture: "./images/magic.gif"
	});
	self.currentKringle = ko.observable();
	self.tempWishlist = ko.observable();
	self.userImage = ko.observable();
	//set initial data
	var api = kringlesApi;


	//functions
	var currentKringle = null;
	self.showSpinner = function(data){
		currentKringle = data;
		self.pickedUser({
			picture: "./images/magic.gif"
		});
		$("#spinner").modal("show");
	}

	self.postKringle = function(winning){

		self.isSpinning(true);

		var data = {
			user: currentKringle.user(),
			kringle: currentKringle.kringle()
			// userToGive: self.possibleUsers()[winning[0] - 1].username
		};

		api.postKringle(data).then(function(response){
			_.delay(function(){
				self.pickedUser({
					name: response.user.name,
					picture: 'images/' + response.user.picture
				});
				self.refresh();

				_.delay(function(){
					self.isSpinning(false);
					$("#spinner").modal("hide");
				}, 1000);
			}, 3000);
		});
	}

	self.refresh = function () {
		// show current logged in user
		api.getCurrentUser().then(function (response) {
			self.userImage("images/" + response.user.picture);	
		});

		// refresh kringles
		api.getKringles().then(function(response){
			self.kringles.removeAll();
			_.each(response.userKringles, function(kringle){
				self.kringles.push(new kringleModel(kringle));
			});
		});
	}

	self.showUpdateWishList = function (kringle) {
		self.currentKringle(kringle);
		self.currentKringle().refreshWishList().then(function () {
			self.tempWishlist(self.currentKringle().yourWishList());
			$("#wishlistInput").modal("show");			
		});
	}

	self.updateWishList = function () {
		var update = kringlesApi.updateWishList(self.currentKringle().kringle(), self.tempWishlist());
		update.then(function () {
			self.currentKringle().refreshWishList();
			$("#wishlistInput").modal("hide");
		});
	}

	// self.getPossibleUsers = function(){
	// 	var data = {
	// 		user: currentKringle.user(),
	// 		kringle: currentKringle.kringle()
	// 	}
	// 	api.getPossibleUsers().then(function(response){
	// 		self.possibleUsers.removeAll();
	// 		_.each(response.users, function(user){
	// 			self.possibleUsers.push({
	// 				name: user.name,
	// 				username: user.username,
	// 				picture: user.picture
	// 			});
	// 		});
	// 		$(".slot").jSlots({
	// 			spinner : "#playBtn",
	// 			winnerNumber : 7,
	// 			number: 1,
	// 			count: self.possibleUsers().length,
	// 			onEnd: self.postKringle,
	// 			easing: "swing"
	// 		});
	// 	});
	// }

	self.logout = function(){
		api.logout().then(function(){
			window.location.href = "/";
		});
	}

	//misc
	self.lockSpin = function(){
		self.isSpinning(true);
	}

	self.refresh();
}

var KringlesVM = new KringlesViewModel();
ko.applyBindings(KringlesVM);
