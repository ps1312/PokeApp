const express = require("express");
const app = express();
const mongoose = require("mongoose");

const mongooseUrlConnect = "mongodb://" + process.env.MLAB_USER + ":" + process.env.MLAB_PASS + "@ds119449.mlab.com:19449/pokemon_db";
mongoose.connect(mongooseUrlConnect, function(err){
    if (err) {
        console.log("Error connecting to database: " + err);
    } else {
        console.log("Connected to dababase");
    }
});

app.get("/", function(req, res){
    res.send("Server working");
});

const port = "8000";
app.listen(port, function(){
    console.log("Server listening at port: " + port);
});