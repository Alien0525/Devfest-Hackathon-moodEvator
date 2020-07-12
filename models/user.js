var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    isAdmin: {type: Boolean, default: false},
    image: String,
    bio: String

});

UserSchema.plugin(passportLocalMongoose); //adds the methods to our user

module.exports = mongoose.model("User", UserSchema);