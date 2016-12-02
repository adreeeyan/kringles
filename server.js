// =======================
// get the packages we need ============
// =======================
var express = require("express");
var app = express();
var cookieParser = require("cookie-parser");
var path = require("path");
var bodyParser = require("body-parser");
var morgan = require("morgan");
var multer = require("multer")
var mongoose = require("mongoose");
var async = require("async");
var _und = require("./js/underscore-min");
var fs = require("fs");
var path = require('path')

var jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens
var config = require("./config"); // get our config file
var User = require("./js/user"); // get our user mongoose model
var Kringle = require("./js/kringle"); // get our kringle mongoose model
var UserKringle = require("./js/user_kringle"); // get our user_kringle mongoose model

// =======================
// configuration =========
// =======================
var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
app.set("thisisnothing", config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan("dev"));

// =======================
// routes ================
// =======================
// basic route
app.use(express.static(__dirname + "/Views"));
app.use("/js", express.static(__dirname + "/js"));
app.use("/css", express.static(__dirname + "/css"));
app.use("/images", express.static(__dirname + "/images"));
app.use("/fonts", express.static(__dirname + "/fonts"));
app.use(cookieParser());

app.get("/", function(req, res) {
	if(req.cookies.token){
		res.redirect("/results");
	}
	res.sendFile("login.html", {"root": path.join(__dirname, "Views")});
});

app.get("/results", function(req, res) {
	if(!req.cookies.token){
		res.redirect("/");
	}
	res.sendFile("results.html", {"root": path.join(__dirname, "Views")});
});

app.get("/register", function(req, res) {
	if(req.cookies.token){
		res.redirect("/");
	}
	res.sendFile("register.html", {"root": path.join(__dirname, "Views")});
});

// app.get("/addkringles", function (req, res) {
// 	// add the kringles list to the user
// 	User.find({}, function (err, users) {
// 		users.forEach(function (user) {
// 			Kringle.find({}, function (err, kringles) {
// 				var items = [];
// 				kringles.forEach(function (kringle) {
// 					items.push({
// 						user: user.username,
// 						kringle: kringle.id
// 					});
// 				});
// 				UserKringle.collection.insert(items, function (err) {
// 					if (err) {
// 						throw err;
// 					}
// 					res.json({ success: true, message: "Good to go!" });												
// 				});
// 			});
// 		});
// 	});
	
// })

// app.get("/setup", function(req, res){

// 	//create the initial users
// 	var users = [
// 		{
// 			username: "paolo",
// 			password: "paopaopao",
// 			name: "Paolo Alonso",
// 			picture: "./images/paolo.jpg"
// 		},
// 		{
// 			username: "jasser",
// 			password: "jassa321",
// 			name: "Jasser Arioste",
// 			picture: "./images/jasser.jpg"
// 		},
// 		{
// 			username: "adrian",
// 			password: "adrianne",
// 			name: "Adrian Dela Piedra",
// 			picture: "./images/adrian.jpg"
// 		},
// 		{
// 			username: "sheen",
// 			password: "sheena909",
// 			name: "Sheen Carbellido",
// 			picture: "./images/sheen.jpg"
// 		},
//         {
// 			username: "ronie",
// 			password: "ronix555",
// 			name: "Ronie Aquino",
// 			picture: "./images/ronie.jpg"
// 		}
// 	];

// 	_und.each(users, function(user){
// 		new User(user).save(function(err){
// 			if(err){
// 				throw err;
// 			}
// 		});
// 	});

// 	var kringles = [
// 		{
// 			id: "00001",
// 			name: "Something that reminds you of your crush",
// 			date: "November 6, 2015"
// 		}
// 		// {
// 		// 	id: "00002",
// 		// 	name: "Something that reminds you of your crush",
// 		// 	date: "November 13, 2015"
// 		// },
// 		// {
// 		// 	id: "00003",
// 		// 	name: "Something squishy",
// 		// 	date: "November 20, 2015"
// 		// },
// 		// {
// 		// 	id: "00004",
// 		// 	name: "Something colorful",
// 		// 	date: "November 27, 2015"
// 		// },
// 		// {
// 		// 	id: "00005",
// 		// 	name: "GIFT GIFT GIFT!",
// 		// 	date: "December 5, 2015"
// 		// }
// 	];

// 	_und.each(kringles, function(kringle){
// 		new Kringle(kringle).save(function(err){
// 			if(err){
// 				throw err;
// 			}
// 		});
// 	});

// 	//populate users_kringles
// 	_und.each(users, function(user){
// 		_und.each(kringles, function(kringle){
// 			var data = {
// 				user: user.username,
// 				kringle: kringle.id,
// 			}
// 			new UserKringle(data).save(function(err){
// 				if(err){
// 					throw err;
// 				}
// 			});
// 		});
// 	});

// 	res.json({ success: true });
// });

// API ROUTES -------------------
// get an instance for api Router
var apiRoutes = express.Router();

//route for authentication
apiRoutes.post("/authenticate", function(req, res){
	User.findOne({
		username: req.body.username
	}, function(err, user){
		if(err){
			throw err;
		}
		if(!user){
			res.json({ success: false, message: "No such user exist." });
		}else if(user){
			//check if password is correct
			if(user.password != req.body.password){
				res.json({ success: false, message: "Incorrect password is provided."});
			}else{
				//create a token because user is found
				var token = jwt.sign(user, app.get("thisisnothing"), {
					expiresInMinutes: 1440
				});

				res.json({
					success: true,
					message: "GOOOOD!",
					token: token
				});
			}
		}
	});
});

apiRoutes.get("/logout", function(req, res){
	res.clearCookie("token");
	res.clearCookie("user");
	res.json({success: true});
});

// route for registration
var upload = multer({ dest: '/images/' });
apiRoutes.post("/register", upload.single('file'), function (req, res) {
	console.log('fileeeeeeee:', req.file, 'bodyyyy', req.body);
	User.findOne({
		username: req.body.username
	}, function(err, user){
		if(err){
			throw err;
		}
		if (user) {
			res.json({success: false, message: "Who are youuu?!! You have the same username as one of us!!"})
		} else {

			var extension = "";
			var picture = "";
			var file = "";
			// upload image file
			if (req.file) {
				extension = path.extname(req.file.originalname);
				picture = req.body.username + extension;
				file = __dirname + '/images/' + picture;
				fs.renameSync(req.file.path, file)
			}
						

			var user = new User();
			user.name = req.body.name;
			user.username = req.body.username;
			user.password = req.body.password;
			user.picture = picture;
			user.save(function (err) {			
				
				// add the kringles list to the user
				// Kringle.find({}, function (err, kringles) {
				// 	var items = [];
				// 	kringles.forEach(function (kringle) {
				// 		items.push({
				// 			user: user.username,
				// 			kringle: kringle.id
				// 		});
				// 	});
				// 	UserKringle.collection.insert(items, function (err) {
				// 		if (err) {
				// 			throw err;
				// 		}
				// 		res.json({ success: true, message: "Good to go!" });												
				// 	});
				// });
				res.json({ success: true, message: "Good to go!" });
			});
		}
	});
});


//middleware here to verify the token
apiRoutes.use(function(req, res, next){
	//check all the possible holder where the token might be placed
	var token = req.body.token || req.query.token || req.headers["x-access-token"] || req.cookies.token;

	if(token){
		//verify the token
		jwt.verify(token, app.get("thisisnothing"), function(err, decoded){
			if(err){
				return res.json({success: false, message: "Who are youuuuu?!!"});
			} else{
				//if correct then pass to the next route
				req.decoded = decoded;
				next();
			}
		});
	} else{
		res.redirect("/");
		return res.status(403).send({
			success: false,
			message: "Please pass the bill."
		});
	}
});

//route to return all the kringle for the specified user
apiRoutes.get("/kringles", function(req, res){
	var data = [];

	UserKringle.find({user: req.cookies.user}, function(err, list){
		async.each(list, function(pair, callback){
			Kringle.findOne({id: pair.kringle}, function(err, kringle){
				User.findOne({username: pair.userToGive}, function(err, user){
					if(err){
						throw err;
					}

					// find the partners wishlist
					UserKringle.findOne({ user: pair.userToGive, kringle: kringle.id }, function (err, partner) {
						data.push({
							user: pair.user,
							kringle: kringle.id,
							date: kringle.date,
							name: kringle.name,
							userToGive: (user) ? user.name : null,
							userToGivePicture: (user) ? user.picture : null,
							yourWishList: pair.wishlist,
							partnerWishList: partner ? partner.wishlist : null
						});
						callback();
					});

				});
			});
		}, function(err){
			if(err){
				throw err;
			}
			res.json({userKringles: data.reverse()});
		});
	});
});

//route to update userToGive field
apiRoutes.post("/kringles", function(req, res){

    var kringle = req.body.kringle;
	var user = req.body.user;
	
	//retrieve list of users that the user had partnered with
	function partneredUsersRoute(pickedUsers) {
		UserKringle.find({ kringle: { $ne: kringle }, user: user }, { userToGive: 1 }, function (err, partners) {
			var partneredUsers = _und.pluck(partners, "userToGive");
			pickedUsersRoute(pickedUsers, partneredUsers);
		});
	}

	//find the unpicked users
	function pickedUsersRoute(pickedUsers, partneredUsers) {
		var unavailableUsers = pickedUsers.concat(partneredUsers);
        User.find({username: {$nin: unavailableUsers, $ne: user}, }, {name: 1, username: 1, picture: 1}, function(err, users){
			var luckyUser = _und.shuffle(users)[0];
			if (luckyUser) {
            	updateUserKringle(luckyUser);								
			}
    	});
	}

	function updateUserKringle(data){
		UserKringle.findOneAndUpdate(
			{
				user: user,
				kringle: kringle,
				userToGive: null
			},
			{
				$set:
					{
						userToGive: data.username
					}
			},
			function(err, num){
				if(err){
					throw err;
				}
				res.json({user: data});
			}
		);
	}

	// find the active members
	User.find({inactive: {$ne: true}}, {name: 1, username: 1, picture: 1}, function(err, users){
		var usersKey = _und.pluck(users, "username");
		UserKringle.find({kringle: kringle}, function(err, list){
			var alreadyPickedUsers = _und.filter(list, function(user){
				return !_und.isEmpty(user.userToGive);
			});
			var haventPickedUsers = _und.filter(list, function(user){
				return _und.isEmpty(user.userToGive);
			});
			var pickedUsers = _und.pluck(alreadyPickedUsers, "userToGive");
			var unpickedUsers = _und.difference(usersKey, pickedUsers);
			//if there are 2 unpickedUsers left and one of them haven't picked yet then automatically assign the bunoter to the user who didn't pick yet
			if(unpickedUsers.length === 2){
				//check if one the unpickedUsers haven't picked yet
				var luckyUser = _und.find(unpickedUsers, function(user){
					return _und.contains(haventPickedUsers, user);
				});
				if(!_und.isEmpty(luckyUser)){
					var userData = _und.find(users, function(user){
						return user.username === luckyUser;
					});
					updateUserKringle(userData);
				}else{
					partneredUsersRoute(pickedUsers);
				}
			}else{
				partneredUsersRoute(pickedUsers);
			}
		});
	});

});

//route to get all the possible users (all users except self)
apiRoutes.post("/possibleUsers", function(req, res){
    UserKringle.find({userToGive: {$ne: null}, kringle: req.body.kringle}, function(err, list){
        var pickedUsers = _und.pluck(list, "userToGive");
        User.find({username: {$nin: pickedUsers, $ne: req.body.user}, }, {name: 1, username: 1, picture: 1}, function(err, users){
    		res.json({users: _und.shuffle(users)});
    	});
    });

});

// route to get the current wishlist for a particular kringle
apiRoutes.get("/wishlist/:kringle", function (req, res) {
	var kringleId = req.params.kringle;
	var userId = req.cookies.user;
	// find the partners wishlist
	UserKringle.findOne({ user: userId, kringle: kringleId }, function (err, user) {
		res.json({
			user: userId,
			kringle: kringleId,
			wishlist: user.wishlist
		});
	});
});

// route to update current wishlist for a particular kringle
apiRoutes.put("/wishlist/:kringle", function (req, res) {
	var kringleId = req.params.kringle;
	var userId = req.cookies.user;
	var wishlist = req.body.wishlist;

	UserKringle.findOneAndUpdate(
		{
			user: userId,
			kringle: kringleId
		},
		{
			$set:
				{
					wishlist: wishlist
				}
		},
		function(err, num){
			if(err){
				throw err;
			}
			res.json({success: true});
		}
	);
});

// route to add a kringle
// todo: guard this route
apiRoutes.post("/addkringle", function (req, res) {
	var id = req.body.id;
	var name = req.body.name;
	var date = req.body.date;
	var kringle = new Kringle();
	kringle.id = id;
	kringle.name = name;
	kringle.date = date;
	kringle.save(function (err) {

		// add the kringle to the users
		User.find({}, function (err, users) {
			var items = [];
			users.forEach(function (user) {
				items.push({
					user: user.username,
					kringle: kringle.id
				});
			});

			if (items.length > 0) {
				UserKringle.collection.insert(items, function (err) {
					if (err) {
						throw err;
					}
					res.json({ success: true, message: "Kringles successfully added to users" });
				})
			} else {
				res.json({ success: true, message: "Kringles not added to users though" });
			}
		});
	});
});

// route to get current logged user
apiRoutes.get("/user", function (req, res) {
	User.findOne({ username: req.cookies.user }, function (err, user) {
		res.json({ user: user });
	});
});


app.use("/api", apiRoutes);

// =======================
// start the server ======
// =======================
app.listen(port);
console.log("Magic happens at http://localhost:" + port);
