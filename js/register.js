function RegisterVM(){
    var self = this;
    self.name = ko.observable("");
	self.username = ko.observable("");
    self.password = ko.observable("");
    self.confirmPassword = ko.observable("");
    self.isRegistering = ko.observable(false);
    self.modal = {
        message: ko.observable("Something went wrong >.<"),
        buttonLabel: ko.observable("Sorry")
    };
    self.validate = function () {
        var isGood = true;
        self.isRegistering(true);

        self.username(self.username().trim());
        self.name(self.name().trim());

        // check if the name is blank
        if (_.isEmpty(self.name())){
            self.modal.message("You should have a name, nameless!!");
            self.modal.buttonLabel("Okayyy..");
        }

        // check if the username is blank
        else if (_.isEmpty(self.username())){
            self.modal.message("How will you login if you have empty username???");
            self.modal.buttonLabel("Okayyy..");
        }

        // check if the password is blank        
        else if (_.isEmpty(self.password())){
            self.modal.message("No no no, passwords cannot be empty.");
            self.modal.buttonLabel("Okayyy..");
        }

        // check if the passwords are the same
        else if (self.password() !== self.confirmPassword()) {
            self.modal.message("Passwords didn't match.");
            self.modal.buttonLabel("Change it!!");
        }

        else {
            self.register();
            // $("#regForm").submit();
            return;
        }

        self.isRegistering(false);                       
        $("#modal").modal("show");   
        return;
    }
	self.register = function(){

        self.isRegistering(true);

        var imageFile = document.getElementById("imageFile").files[0];
        
        var fd = new FormData();
        fd.append("name", self.name());
        fd.append("username", self.username());
        fd.append("password", self.password());
        fd.append("file", imageFile);

		var onSuccess = function(response){
            if (response.success) {
                self.modal.message(response.message);
                self.modal.buttonLabel("Orayts!");
				$("#modal").modal("show");
            } else {
                self.modal.message(response.message);
                self.modal.buttonLabel("Sorry");
				$("#modal").modal("show");
			}
			self.isRegistering(false);
        };
        
		jQuery.ajax({
			type: "POST",
			url: "/api/register",
            data: fd,
            processData: false,
            contentType: false,
			success: onSuccess
		});
	}
}

ko.applyBindings(new RegisterVM());
