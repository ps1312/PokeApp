const express = require("express");
const app = express();

app.get("/", function(req, res){
    res.send("Server working");
});

const port = "8000";
app.listen(port, function(){
    console.log("Server listening at port: " + port);
});