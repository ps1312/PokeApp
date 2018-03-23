const express = require("express");
const userRouter = express.Router();
const passport = require("passport");
const User = require("../models/user");

//Get register form
userRouter.get("/register", function(req, res){
    res.render("user/register");
});

//Get login form
userRouter.get("/login", function(req, res){
    res.render("user/login");
});

//User profile page
userRouter.get("/dashboard", function(req, res){
    res.render("dashboard");
});

//Authenticate login
userRouter.post("/login",passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login"}));

//Save user on db and authenticate
userRouter.post("/register", function(req, res, next){
    let newUser = {
        email: req.body.email,
        username: req.body.username
    };

    //Register is a function provided by passport-local-mongoose
    User.register(newUser, req.body.password, function(err, createdUser){
        if (err) {
            console.log("Error creating user: " + err);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/dashboard");
        });
    });
});

//Logout user
userRouter.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

module.exports = userRouter;