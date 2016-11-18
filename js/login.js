function LoginVM(){
	var self = this;
	self.username = ko.observable();
	self.password = ko.observable();
	self.isLoggingIn = ko.observable(false);
	self.login = function(){

		self.isLoggingIn(true);
		var data = {
			username: self.username(),
			password: self.password()
		};

		var onSuccess = function(response){
			if(response.success){
				Cookies.set("token", response.token);
				Cookies.set("user", self.username());
				window.location.href = "/results.html";
			}else{
				$("#message").modal("show");
			}
			self.isLoggingIn(false);
		};

		$.ajax({
			type: "POST",
			url: "/api/authenticate",
			data: data,
			success: onSuccess
		});
	}
}

ko.applyBindings(new LoginVM());
