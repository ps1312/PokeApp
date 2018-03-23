const express = require("express");
const userRouter = express.Router();
const passport = require("passport");
const User = require("../models/user");
const authMiddleware = require("../middleware/authentication");

//Config for multerS3 (send uploaded picture to S3Bucket)
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
aws.config.loadFromPath("./config.json");

const s3Bucket = new aws.S3();
const upload = multer({
    storage: multerS3({
        s3: s3Bucket,
        bucket: process.env.BUCKET_NAME,
        key: function(req, file, cb) {
            const fileName = Date.now() + "-" + file.originalname;
            cb(null, fileName);
        }
    })
});

//Get register form
userRouter.get("/register", function(req, res){
    res.render("user/register");
});

//Get login form
userRouter.get("/login", function(req, res){
    res.render("user/login");
});

//User profile page
userRouter.get("/dashboard", authMiddleware.isLoggedIn, function(req, res){
    s3Bucket.getSignedUrl('getObject', {Bucket: process.env.BUCKET_NAME, Key: req.user.profileImgKey}, function(err, url){
        res.render("dashboard", {photoUrl: url});
    });
});

//Authenticate login
userRouter.post("/login",passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login"}));

//Save user on db and authenticate
userRouter.post("/register", upload.array("profileImg", 1), function(req, res, next){
    //upload.array uploads to s3bucket
    let newUser = {
        email: req.body.email,
        username: req.body.username,
        profileImgKey: req.files[0].key
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