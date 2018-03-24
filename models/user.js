var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true}, //match: [/.+\@.+\..+/, 'Please enter a valid email']}, validacao feita no browser
    username: {type: String, required: true, unique: true},
    password: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    profileImgKey: String,
    catchedPokemonsNames: [String]
});

userSchema.plugin(passportLocalMongoose);

var User = mongoose.model("User", userSchema);

module.exports = User;