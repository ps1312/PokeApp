const express = require("express");
const userRouter = express.Router();
const passport = require("passport");
const User = require("../models/user");
const authMiddleware = require("../middleware/authentication");

//Package to request to pokemon api (auto-caching)
const pokedex = require("pokedex-promise-v2");
const P = new pokedex();

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
    P.getPokemonsList()
    .then(function(response) {
        s3Bucket.getSignedUrl('getObject', {Bucket: process.env.BUCKET_NAME, Key: req.user.profileImgKey}, function(err, url){
            res.render("dashboard", {photoUrl: url, nationalPokedexCount: response.count});
        });
    })
    .catch(function(error) {
        console.log('There was an ERROR: ', error);
        req.flash("error", "O servidor da PokeApi demorou muito para responder");
        res.redirect("/dashboard");
    });
});

//Authenticate login
    userRouter.post("/login", passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash : true,
    successFlash : true
    }), function(req, res){
    });

//Save user on db and authenticate
userRouter.post("/register", upload.array("profileImg", 1), function(req, res, next){

    //Error if user don't upload a profile pic
    if (req.files.length < 1){
        req.flash("error", "Please, upload a profile image");
        return res.redirect("/register");
    }

    //upload.array uploads to s3bucket
    let newUser = {
        email: req.body.email,
        username: req.body.username,
        profileImgKey: req.files[0].key
    };

    //Register is a function provided by passport-local-mongoose
    User.register(newUser, req.body.password, function(err, createdUser){
        if (err) {
            console.log("Error creating user: " + err.message);
            req.flash("error", err.message);
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
    req.flash("success", "Logged out with success");
    res.redirect("/");
});

//Implementation of password reset
const async = require("async");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

//Get the new forgot password form
userRouter.get("/forgot", function(req, res){
    res.render("user/forgot_password");
});

//Save token for reseting password on user
userRouter.post('/forgot', function(req, res, next) {
    async.waterfall([
    function(done) {
        crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
        });
    },
    function(token, done) {
        User.findOne({ username: req.body.username }, function(err, user) {
        if (!user) {
            console.log('error', 'No account with that email address exists.');
            return res.redirect('/login');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
            done(err, token, user);
        });
        });
    },
    function(token, user, done) {
        const emailName = process.env.RECOVER_EMAIL;
        const emailPass = process.env.RECOVER_PASS;
        const smtpTransport = nodemailer.createTransport({
        //Email example
        service: 'Gmail',
        auth: {
            user: emailName,
            pass: emailPass
        }
        });
        const mailOptions = {
        to: user.email,
        from: 'passwordreset@pokedex.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
        console.log('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
        });
    }
    ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
    });
});


userRouter.get("/reset/:reset_token", function(req, res){
    User.findOne({ resetPasswordToken: req.params.reset_token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          console.log('error', 'Password reset token is invalid or has expired.');
          return res.redirect('/forgot');
        }
        res.render('user/reset_password', {resetToken: req.params.reset_token});
      });
});

userRouter.post("/reset/:reset_token", function(req, res){
    async.waterfall([
        function(done) {
        User.findOne({ resetPasswordToken: req.params.reset_token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
            if (!user) {
            console.log('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
            }
    
            user.setPassword(req.body.password, function(){
                user.save();
                res.redirect("/login");
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
            });
        });
        },
    ], function(err) {
        res.redirect('/');
    });
});

module.exports = userRouter;