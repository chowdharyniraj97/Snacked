var express = require("express");
var app = express();
var bodyParser = require("body-parser");

app.set("view engine", "ejs");
var path = require("path");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
var process = require("process");
console.log(process.cwd());
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/views/index.html"));
});

app.listen(3000, () => {
  console.log("server is running");
});
