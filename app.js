const express = require("express");
const app = express();
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user");
const expressSession = require("express-session");
const mongoose = require("mongoose");
const bp = require("body-parser");
const flash = require("connect-flash");

//Connecting to mLab (mongoDB web service)
const mongooseUrlConnect = process.env.MONGODB_URL;
mongoose.connect(mongooseUrlConnect, function(err){
    if (err) {
        console.log("Error connecting to database: " + err);
    } else {
        console.log("Connected to dababase");
    }
});

//Body parser to read html fields on post
app.use(bp.urlencoded({extended: true}));

//Set view engine to ejs
app.set("view engine", "ejs");

//Passport config for login
app.use(expressSession({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Config app to use connect-flash
app.use(flash());

//For easy access of user and flash messages in ejs
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");    
    next();
});

const userRoutes = require("./routes/user");
const catchRoutes = require("./routes/catch");
app.use("/", userRoutes)
app.use("/catch", catchRoutes);

app.get("/", function(req, res){
    res.render("home");
});

const port = "8000";
app.listen(port, function(){
    console.log("Server listening at port: " + port);
});
