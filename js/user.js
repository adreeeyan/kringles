//get an instance of mongoose and mongoose schema
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// set up our user model
module.exports = mongoose.model("User", new Schema({
	username: String,
	password: String,
	name: String,
	picture: String
}));